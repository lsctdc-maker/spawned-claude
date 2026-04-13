/**
 * /api/analyze-designs — NAS 디자인 파일 분석 파이프라인
 *
 * POST body (multipart/form-data):
 *   - file: PSD 또는 이미지 파일 (JPG/PNG)
 *   - fileName: 원본 파일명
 *
 * 처리 흐름:
 *   PSD → ag-psd 레이어 추출 → 섹션 분리
 *   이미지 → sharp 픽셀 분석 → 섹션 분리
 *   각 섹션 → Claude Vision 분석 → 구조화 데이터
 *   → Supabase에 저장 + Supabase Storage에 섹션 이미지 업로드
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parsePsd } from '@/lib/psd-parser';
import { findSectionBoundaries, extractSectionImages } from '@/lib/image-splitter';
import { analyzeSection, SectionAnalysis } from '@/lib/section-analyzer';

// 관리자 전용 API — service_role key로 인증
function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function isAuthorized(req: NextRequest): boolean {
  const apiKey = req.headers.get('x-api-key');
  return apiKey === process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const fileName = (formData.get('fileName') as string) || file?.name || 'unknown';

    if (!file) {
      return NextResponse.json({ error: '파일이 필요합니다' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const isPsd = fileName.toLowerCase().endsWith('.psd');
    const supabase = getServiceSupabase();

    // ── 1. 섹션 분리 ──
    interface SectionData {
      index: number;
      imageBuffer: Buffer;
      psdMeta?: {
        textLayers: any[];
        imageLayers: any[];
        name: string;
      };
    }

    const sections: SectionData[] = [];

    if (isPsd) {
      // PSD: ag-psd로 레이어 그룹 추출
      // ag-psd의 initialize-canvas는 Node.js 환경에서 필요
      try {
        await import('ag-psd/initialize-canvas');
      } catch {
        // initialize-canvas가 없으면 이미지 추출 불가, 폴백
      }

      const psdResult = parsePsd(buffer, fileName);

      for (const sec of psdResult.sections) {
        if (sec.compositeBuffer) {
          sections.push({
            index: sec.index,
            imageBuffer: sec.compositeBuffer,
            psdMeta: {
              textLayers: sec.textLayers,
              imageLayers: sec.imageLayers,
              name: sec.name,
            },
          });
        }
      }

      // PSD 섹션 추출 실패 시 → 전체 합성 이미지로 이미지 분리
      if (sections.length === 0 && psdResult.compositeBuffer) {
        const boundaries = await findSectionBoundaries(psdResult.compositeBuffer);
        const sectionImages = await extractSectionImages(psdResult.compositeBuffer, boundaries.sections);
        for (const si of sectionImages) {
          sections.push({ index: si.index, imageBuffer: si.imageBuffer });
        }
      }
    } else {
      // 이미지: sharp로 섹션 경계 탐지 + 분리
      const boundaries = await findSectionBoundaries(buffer);
      const sectionImages = await extractSectionImages(buffer, boundaries.sections);
      for (const si of sectionImages) {
        sections.push({ index: si.index, imageBuffer: si.imageBuffer });
      }
    }

    if (sections.length === 0) {
      return NextResponse.json({
        error: '섹션을 분리할 수 없습니다. 파일을 확인해주세요.',
      }, { status: 422 });
    }

    // ── 2. 각 섹션 분석 + 업로드 ──
    const results: Array<{
      index: number;
      imageUrl: string;
      analysis: SectionAnalysis;
      psdMeta?: any;
    }> = [];

    for (const sec of sections) {
      // 2a. 이미지 업로드 (Supabase Storage)
      const storagePath = `analyzed/${encodeURIComponent(fileName)}/section_${sec.index}.png`;
      const { error: uploadError } = await supabase.storage
        .from('template-backgrounds')
        .upload(storagePath, sec.imageBuffer, {
          contentType: 'image/png',
          upsert: true,
        });

      if (uploadError) {
        console.warn(`섹션 ${sec.index} 업로드 실패:`, uploadError.message);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('template-backgrounds')
        .getPublicUrl(storagePath);

      const imageUrl = urlData.publicUrl;

      // 2b. Claude Vision 분석
      let analysis: SectionAnalysis;
      try {
        analysis = await analyzeSection(sec.imageBuffer);
      } catch (e: any) {
        console.warn(`섹션 ${sec.index} 분석 실패:`, e.message);
        analysis = {
          sectionType: 'unknown',
          layoutPattern: 'unknown',
          textSlots: [],
          imageSlots: [],
          backgroundColor: '#ffffff',
          colorScheme: 'light',
          categoryFit: [],
          toneFit: [],
          styleTags: [],
          confidence: 0,
        };
      }

      // PSD 메타데이터가 있으면 병합 (더 정확한 텍스트 정보)
      if (sec.psdMeta && sec.psdMeta.textLayers.length > 0) {
        // PSD 텍스트 레이어의 실제 텍스트로 보완
        for (const psdText of sec.psdMeta.textLayers) {
          const matchingSlot = analysis.textSlots.find(
            s => s.role === psdText.role
          );
          if (matchingSlot && psdText.text) {
            matchingSlot.estimatedText = psdText.text;
            matchingSlot.estimatedFontSize = psdText.fontSize;
          }
        }
      }

      // 2c. DB에 저장
      const { error: dbError } = await supabase
        .from('template_analysis')
        .upsert({
          source_file: fileName,
          section_index: sec.index,
          section_image_url: imageUrl,
          section_type: analysis.sectionType,
          layout_pattern: analysis.layoutPattern,
          text_slots: analysis.textSlots,
          image_slots: analysis.imageSlots,
          background_color: analysis.backgroundColor,
          color_scheme: analysis.colorScheme,
          category_fit: analysis.categoryFit,
          tone_fit: analysis.toneFit,
          style_tags: analysis.styleTags,
          confidence: analysis.confidence,
          psd_metadata: sec.psdMeta || null,
        }, {
          onConflict: 'source_file,section_index',
        });

      if (dbError) {
        console.warn(`섹션 ${sec.index} DB 저장 실패:`, dbError.message);
      }

      results.push({
        index: sec.index,
        imageUrl,
        analysis,
        psdMeta: sec.psdMeta,
      });

      // Rate limit 방지
      if (sec.index < sections.length - 1) {
        await new Promise(r => setTimeout(r, 300));
      }
    }

    return NextResponse.json({
      success: true,
      fileName,
      totalSections: sections.length,
      analyzedSections: results.length,
      sections: results,
    });

  } catch (e: any) {
    console.error('분석 파이프라인 오류:', e);
    return NextResponse.json(
      { error: e.message || '분석 중 오류 발생' },
      { status: 500 },
    );
  }
}
