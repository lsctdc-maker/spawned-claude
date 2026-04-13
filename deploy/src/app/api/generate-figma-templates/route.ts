/**
 * /api/generate-figma-templates — 분석 데이터 → Figma 템플릿 스펙 생성
 *
 * POST body (JSON):
 *   - source: "json" | "supabase"  (데이터 소스)
 *   - category?: string            (특정 카테고리만)
 *   - limit?: number               (최대 개수)
 *
 * 처리 흐름:
 *   1. design-knowledge.json 또는 Supabase에서 분석 데이터 로드
 *   2. analysisToFigmaSpecs()로 Figma 프레임 스펙 변환
 *   3. Figma MCP 사용 가능시 → 직접 Figma에 생성
 *      Figma MCP 없을 시 → JSON 스펙 반환 (수동 생성용)
 *
 * 응답:
 *   { specs: TemplateGenerationResult[], totalFrames: number }
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { batchGenerateFigmaSpecs, TemplateGenerationResult } from '@/lib/figma-template-generator';

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
    const body = await req.json();
    const { source = 'json', category, limit } = body;

    let analyses: any[] = [];

    if (source === 'supabase') {
      // Supabase template_analysis에서 로드
      const supabase = getServiceSupabase();

      let query = supabase
        .from('template_analysis')
        .select('*')
        .eq('is_approved', true)
        .order('confidence', { ascending: false });

      if (category) {
        query = query.contains('category_fit', [category]);
      }
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);

      // Supabase 데이터를 분석 형식으로 변환
      const grouped = new Map<string, any>();
      for (const row of data || []) {
        const key = row.source_file;
        if (!grouped.has(key)) {
          grouped.set(key, {
            fileName: row.source_file,
            clientName: row.source_file.split('/')[0] || 'unknown',
            category: row.category_fit?.[0] || 'general',
            sections: [],
          });
        }
        grouped.get(key)!.sections.push({
          type: row.section_type,
          layout: row.layout_pattern,
          bgColor: row.background_color,
          hasProductImage: (row.image_slots || []).length > 0,
          textAlign: 'center',
          textSlots: row.text_slots,
          imageSlots: row.image_slots,
        });
      }
      analyses = Array.from(grouped.values());

    } else {
      // design-knowledge.json에서 로드
      const designKnowledge = await import('@/data/design-knowledge.json');
      analyses = (designKnowledge as any).analyses || [];

      if (category) {
        analyses = analyses.filter((a: any) => a.category === category);
      }
      if (limit) {
        analyses = analyses.slice(0, limit);
      }
    }

    if (analyses.length === 0) {
      return NextResponse.json({
        error: '분석 데이터가 없습니다.',
      }, { status: 404 });
    }

    // Figma 스펙 생성
    const specs: TemplateGenerationResult[] = batchGenerateFigmaSpecs(analyses);

    const totalFrames = specs.reduce((sum, s) => sum + s.frames.length, 0);

    return NextResponse.json({
      success: true,
      source,
      analysisCount: analyses.length,
      totalFrames,
      specs,
    });

  } catch (e: any) {
    console.error('Figma 템플릿 생성 오류:', e);
    return NextResponse.json(
      { error: e.message || '생성 중 오류 발생' },
      { status: 500 },
    );
  }
}
