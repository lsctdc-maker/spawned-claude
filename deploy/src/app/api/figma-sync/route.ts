/**
 * Figma → Supabase 동기화 API
 *
 * Figma REST API로 템플릿 프레임을 읽고:
 * 1. [slot:*] 레이어에서 텍스트/이미지 슬롯 추출
 * 2. 프레임 → 2x PNG export → Supabase Storage 업로드
 * 3. 메타데이터 JSON → figma_templates 테이블 UPSERT
 *
 * 관리자만 호출 (service_role key 사용)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { invalidateCache } from '@/lib/figma-templates';

const FIGMA_API = 'https://api.figma.com/v1';

// ─── Figma API 헬퍼 ───

async function figmaFetch(path: string) {
  const token = process.env.FIGMA_API_TOKEN;
  if (!token) throw new Error('FIGMA_API_TOKEN 환경변수가 설정되지 않았습니다');

  const res = await fetch(`${FIGMA_API}${path}`, {
    headers: { 'X-Figma-Token': token },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Figma API ${res.status}: ${text}`);
  }

  return res.json();
}

// ─── 슬롯 추출 ───

interface SlotInfo {
  binding: string;
  type: 'text' | 'image';
  left: number;
  top: number;
  width: number;
  height: number;
  fontSize?: number;
  fontWeight?: number;
  useHeadline?: boolean;
  fill?: string;
  textAlign?: string;
  lineHeight?: number;
  letterSpacing?: number;
  name?: string;
  opacity?: number;
}

function figmaWeightToNumber(weight?: string): number {
  const map: Record<string, number> = {
    Thin: 100, ExtraLight: 200, UltraLight: 200,
    Light: 300, Regular: 400, Medium: 500,
    SemiBold: 600, DemiBold: 600, Bold: 700,
    ExtraBold: 800, UltraBold: 800, Black: 900, Heavy: 900,
  };
  return map[weight || 'Regular'] || 400;
}

function figmaColorToHex(color?: { r: number; g: number; b: number }): string {
  if (!color) return '#000000';
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function extractSlots(
  children: any[],
  parentX: number,
  parentY: number,
): { textSlots: SlotInfo[]; imageSlots: SlotInfo[] } {
  const textSlots: SlotInfo[] = [];
  const imageSlots: SlotInfo[] = [];

  for (const child of children) {
    const name: string = child.name || '';
    const match = name.match(/^\[slot:([^\]]+)\]/);
    if (!match) continue;

    const binding = match[1];
    const bounds = child.absoluteBoundingBox;
    if (!bounds) continue;

    const left = Math.round(bounds.x - parentX);
    const top = Math.round(bounds.y - parentY);
    const width = Math.round(bounds.width);
    const height = Math.round(bounds.height);

    if (child.type === 'TEXT') {
      const style = child.style || {};
      const isSerif = ['Noto Serif KR', 'Nanum Myeongjo', 'Batang']
        .some((f: string) => (style.fontFamily || '').includes(f));

      textSlots.push({
        binding,
        type: 'text',
        left, top, width, height,
        fontSize: style.fontSize,
        fontWeight: figmaWeightToNumber(style.fontPostScriptName?.includes('Bold') ? 'Bold' : style.fontWeight),
        useHeadline: isSerif,
        fill: child.fills?.[0]?.color ? figmaColorToHex(child.fills[0].color) : undefined,
        textAlign: style.textAlignHorizontal?.toLowerCase(),
        lineHeight: style.lineHeightPercentFontSize
          ? Math.round(style.lineHeightPercentFontSize) / 100
          : undefined,
        letterSpacing: style.letterSpacing,
        name: binding === 'title' ? '메인 타이틀'
          : binding === 'body' ? '본문'
          : binding === 'bodyPreview' ? '서브 카피'
          : binding === 'label' ? '라벨'
          : binding === 'cta' ? 'CTA'
          : `슬롯 ${binding}`,
        opacity: child.opacity,
      });
    } else {
      // IMAGE 슬롯 (Rectangle, Frame, Instance 등)
      imageSlots.push({
        binding,
        type: 'image',
        left, top, width, height,
      });
    }
  }

  return { textSlots, imageSlots };
}

// ─── 메타데이터 파싱 ───

function parseDescription(description?: string): Record<string, any> {
  if (!description) return {};
  try {
    // JSON 블록 추출 (description에서 {...} 부분)
    const jsonMatch = description.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch { /* ignore */ }
  return {};
}

// ─── 메인 핸들러 ───

export async function POST(request: NextRequest) {
  // 인증: service_role 또는 admin 확인
  const authHeader = request.headers.get('authorization');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY 미설정' }, { status: 500 });
  }

  // 간단한 API key 인증 (프로덕션에서는 더 강화 필요)
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== serviceKey && authHeader !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const fileKey = body.fileKey || process.env.FIGMA_FILE_KEY;
  const nodeIds: string[] | undefined = body.nodeIds;

  if (!fileKey) {
    return NextResponse.json({ error: 'FIGMA_FILE_KEY 미설정' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
  );

  const synced: string[] = [];
  const errors: { nodeId: string; error: string }[] = [];

  try {
    // Step 1: 파일 구조 읽기
    let framesToSync: { id: string; name: string }[] = [];

    if (nodeIds?.length) {
      // 특정 노드만 동기화
      framesToSync = nodeIds.map(id => ({ id, name: '' }));
    } else {
      // 전체 파일 스캔 → [섹션타입-변형] 패턴의 프레임 필터
      const file = await figmaFetch(`/files/${fileKey}?depth=2`);
      for (const page of file.document?.children || []) {
        for (const child of page.children || []) {
          if (child.type === 'FRAME' && /^\[[\w_]+-[A-Z]\]/.test(child.name)) {
            framesToSync.push({ id: child.id, name: child.name });
          }
        }
      }
    }

    if (!framesToSync.length) {
      return NextResponse.json({
        message: '동기화할 프레임이 없습니다. [섹션타입-변형ID] 형식의 프레임이 필요합니다.',
        synced: 0,
      });
    }

    // Step 2: 각 프레임 처리
    for (const frame of framesToSync) {
      try {
        // 프레임 상세 읽기
        const nodeData = await figmaFetch(`/files/${fileKey}/nodes?ids=${frame.id}`);
        const node = nodeData.nodes?.[frame.id]?.document;
        if (!node) {
          errors.push({ nodeId: frame.id, error: '노드를 찾을 수 없습니다' });
          continue;
        }

        const frameName = node.name || frame.name;
        const bounds = node.absoluteBoundingBox;
        if (!bounds) {
          errors.push({ nodeId: frame.id, error: 'absoluteBoundingBox 없음' });
          continue;
        }

        // 프레임 이름에서 섹션타입 + 변형ID 파싱: [hooking-A] → hooking, A
        const nameMatch = frameName.match(/^\[(\w+)-([A-Z])\]/);
        if (!nameMatch) {
          errors.push({ nodeId: frame.id, error: `이름 형식 오류: ${frameName}` });
          continue;
        }
        const sectionType = nameMatch[1];
        const variantId = nameMatch[2];

        // 슬롯 추출
        const { textSlots, imageSlots } = extractSlots(
          node.children || [],
          bounds.x,
          bounds.y,
        );

        // 메타데이터 파싱 (프레임 description)
        const meta = parseDescription(node.description);

        // PNG export
        const imgData = await figmaFetch(
          `/images/${fileKey}?ids=${frame.id}&format=png&scale=2`,
        );
        const pngUrl = imgData.images?.[frame.id];
        if (!pngUrl) {
          errors.push({ nodeId: frame.id, error: 'PNG export 실패' });
          continue;
        }

        // PNG 다운로드 → Supabase Storage 업로드
        const pngRes = await fetch(pngUrl);
        const pngBuffer = await pngRes.arrayBuffer();
        const storagePath = `${sectionType}/${sectionType}-${variantId}.png`;

        const { error: uploadError } = await supabase.storage
          .from('template-backgrounds')
          .upload(storagePath, pngBuffer, {
            contentType: 'image/png',
            upsert: true,
          });

        if (uploadError) {
          errors.push({ nodeId: frame.id, error: `Storage 업로드 실패: ${uploadError.message}` });
          continue;
        }

        // Storage public URL
        const { data: urlData } = supabase.storage
          .from('template-backgrounds')
          .getPublicUrl(storagePath);

        // DB UPSERT
        const { error: dbError } = await supabase
          .from('figma_templates')
          .upsert({
            name: frameName.replace(/^\[|\]$/g, ''),
            section_type: meta.sectionType || sectionType,
            variant_id: meta.variantId || variantId,
            figma_file_key: fileKey,
            figma_node_id: frame.id,
            figma_last_synced: new Date().toISOString(),
            bg_image_url: urlData.publicUrl,
            bg_image_width: Math.round(bounds.width),
            bg_image_height: Math.round(bounds.height),
            text_slots: textSlots,
            image_slots: imageSlots.map(s => ({
              binding: s.binding,
              left: s.left,
              top: s.top,
              maxWidth: s.width,
              maxHeight: s.height,
            })),
            category_tags: meta.categoryTags || [],
            tone_tags: meta.toneTags || [],
            style_tags: meta.styleTags || [],
            color_scheme: meta.colorScheme || 'dark',
            quality_score: meta.qualityScore || 5,
            is_active: true,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'figma_file_key,figma_node_id',
          });

        if (dbError) {
          errors.push({ nodeId: frame.id, error: `DB 저장 실패: ${dbError.message}` });
          continue;
        }

        synced.push(frameName);
      } catch (e: any) {
        errors.push({ nodeId: frame.id, error: e.message || String(e) });
      }
    }

    // 캐시 무효화
    invalidateCache();

    return NextResponse.json({
      success: true,
      synced: synced.length,
      syncedFrames: synced,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: `동기화 실패: ${e.message}` },
      { status: 500 },
    );
  }
}
