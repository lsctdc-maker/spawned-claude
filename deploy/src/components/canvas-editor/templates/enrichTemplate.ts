import { SectionTemplate, ShapeObjectDef, TextObjectDef } from './types';
import { ManuscriptSectionType } from '@/lib/types';

/**
 * Phase 5-1: 템플릿 자동 풍부화.
 *
 * 기존 템플릿(텍스트 3 + 도형 1-3)에 아래 데코레이티브 레이어를 자동 추가:
 * - 넘버링 배지 (Point 01/02/03)
 * - 아이콘 플레이스홀더 3개
 * - 추가 액센트 바
 * - 장식용 원/도형
 * - 상단 라벨 배경 rect
 *
 * 결과: 섹션당 총 10-15개 편집 가능 객체.
 *
 * 모든 추가 레이어는 `selectable: true`로 사용자가 삭제/이동/편집 가능.
 * 이름에 "[AI 데코]" 접두사 붙여 레이어 패널에서 식별.
 */

// 섹션 타입별 프리셋 설정
interface EnrichPreset {
  showNumbering: boolean;       // Point 01/02/03 배지 3개
  numberingTop: number;          // 배지 세로 위치
  showIconGrid: boolean;         // 하단 아이콘 3개
  iconGridTop: number;
  iconNames: string[];           // 3개 아이콘 이름
  showSideAccent: boolean;       // 우측 세로 액센트 바
  showCornerDeco: boolean;       // 좌상/우하 코너 장식 원
  showAmbientBlobs: boolean;     // 뒤쪽 반투명 블롭 2-3개
  iconGridColor?: string;        // 기본은 accent
}

const SECTION_PRESETS: Partial<Record<ManuscriptSectionType, EnrichPreset>> = {
  hooking: {
    showNumbering: false,
    numberingTop: 420,
    showIconGrid: true,
    iconGridTop: 460,
    iconNames: ['sparkles', 'heart', 'star'],
    showSideAccent: true,
    showCornerDeco: true,
    showAmbientBlobs: true,
  },
  hero: {
    showNumbering: false,
    numberingTop: 420,
    showIconGrid: true,
    iconGridTop: 460,
    iconNames: ['sparkles', 'heart', 'star'],
    showSideAccent: true,
    showCornerDeco: true,
    showAmbientBlobs: true,
  },
  problem: {
    showNumbering: true,     // 문제 3개 넘버링
    numberingTop: 280,
    showIconGrid: true,
    iconGridTop: 420,
    iconNames: ['circle-check', 'triangle-alert', 'circle-x'],
    showSideAccent: false,
    showCornerDeco: true,
    showAmbientBlobs: true,
  },
  solution: {
    showNumbering: false,
    numberingTop: 340,
    showIconGrid: true,
    iconGridTop: 380,
    iconNames: ['check', 'zap', 'shield'],
    showSideAccent: true,
    showCornerDeco: true,
    showAmbientBlobs: true,
  },
  features: {
    showNumbering: true,     // Point 01/02/03
    numberingTop: 240,
    showIconGrid: true,
    iconGridTop: 400,
    iconNames: ['zap', 'shield', 'star'],
    showSideAccent: false,
    showCornerDeco: true,
    showAmbientBlobs: true,
  },
  detail: {
    showNumbering: false,
    numberingTop: 300,
    showIconGrid: true,
    iconGridTop: 420,
    iconNames: ['sparkles', 'check', 'award'],
    showSideAccent: true,
    showCornerDeco: false,
    showAmbientBlobs: true,
  },
  howto: {
    showNumbering: true,     // Step 01/02/03
    numberingTop: 220,
    showIconGrid: true,
    iconGridTop: 420,
    iconNames: ['play', 'hand', 'check'],
    showSideAccent: false,
    showCornerDeco: true,
    showAmbientBlobs: false,
  },
  social_proof: {
    showNumbering: false,
    numberingTop: 260,
    showIconGrid: true,
    iconGridTop: 380,
    iconNames: ['star', 'star', 'star'],
    showSideAccent: true,
    showCornerDeco: true,
    showAmbientBlobs: true,
  },
  trust: {
    showNumbering: false,
    numberingTop: 260,
    showIconGrid: true,
    iconGridTop: 320,
    iconNames: ['shield', 'award', 'badge-check'],
    showSideAccent: false,
    showCornerDeco: false,
    showAmbientBlobs: true,
  },
  specs: {
    showNumbering: false,
    numberingTop: 220,
    showIconGrid: true,
    iconGridTop: 340,
    iconNames: ['ruler', 'package', 'info'],
    showSideAccent: true,
    showCornerDeco: false,
    showAmbientBlobs: false,
  },
  guarantee: {
    showNumbering: false,
    numberingTop: 220,
    showIconGrid: true,
    iconGridTop: 320,
    iconNames: ['shield', 'refresh-cw', 'phone'],
    showSideAccent: false,
    showCornerDeco: true,
    showAmbientBlobs: true,
  },
  event_banner: {
    showNumbering: false,
    numberingTop: 150,
    showIconGrid: false,
    iconGridTop: 300,
    iconNames: ['gift', 'tag', 'clock'],
    showSideAccent: true,
    showCornerDeco: true,
    showAmbientBlobs: true,
  },
  cta: {
    showNumbering: false,
    numberingTop: 380,
    showIconGrid: true,
    iconGridTop: 440,
    iconNames: ['gift', 'shopping-cart', 'tag'],
    showSideAccent: true,
    showCornerDeco: true,
    showAmbientBlobs: true,
  },
};

const DEFAULT_PRESET: EnrichPreset = {
  showNumbering: false,
  numberingTop: 260,
  showIconGrid: true,
  iconGridTop: 380,
  iconNames: ['sparkles', 'star', 'heart'],
  showSideAccent: true,
  showCornerDeco: true,
  showAmbientBlobs: true,
};

/**
 * 템플릿에 데코레이티브 레이어 자동 추가.
 * 원본 template은 immutable — 새 객체 반환.
 */
export function enrichTemplate(template: SectionTemplate): SectionTemplate {
  const preset = SECTION_PRESETS[template.sectionType] || DEFAULT_PRESET;
  const canvasHeight = template.canvasHeight;
  const extraShapes: ShapeObjectDef[] = [];
  const extraTexts: TextObjectDef[] = [];

  // 1) Ambient blobs (뒤쪽 반투명 장식 원)
  if (preset.showAmbientBlobs) {
    extraShapes.push(
      {
        type: 'circle',
        left: -80, top: -80,
        radius: 160,
        fill: '{colors.accent}',
        opacity: 0.06,
        selectable: true,
        name: '[AI 데코] 블롭 좌상',
      },
      {
        type: 'circle',
        left: 780, top: canvasHeight - 120,
        radius: 140,
        fill: '{colors.accent}',
        opacity: 0.05,
        selectable: true,
        name: '[AI 데코] 블롭 우하',
      },
    );
  }

  // 2) Corner 장식 (작은 원)
  if (preset.showCornerDeco) {
    extraShapes.push(
      {
        type: 'circle',
        left: 30, top: 30,
        radius: 6,
        fill: '{colors.accent}',
        opacity: 0.4,
        selectable: true,
        name: '[AI 데코] 코너 점 좌상',
      },
      {
        type: 'circle',
        left: 820, top: 30,
        radius: 6,
        fill: '{colors.accent}',
        opacity: 0.4,
        selectable: true,
        name: '[AI 데코] 코너 점 우상',
      },
    );
  }

  // 3) 우측 세로 액센트 바
  if (preset.showSideAccent) {
    extraShapes.push({
      type: 'gradient-rect',
      left: 830, top: 100,
      width: 4, height: canvasHeight - 200,
      gradient: {
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: 0, y2: canvasHeight - 200 },
        colorStops: [
          { offset: 0, color: 'rgba(255,255,255,0)' },
          { offset: 0.5, color: '{colors.accent}' },
          { offset: 1, color: 'rgba(255,255,255,0)' },
        ],
      },
      opacity: 0.6,
      selectable: true,
      name: '[AI 데코] 우측 액센트 바',
    });
  }

  // 4) 넘버링 배지 3개 (Point 01/02/03)
  if (preset.showNumbering) {
    const centerX = 430;
    const spacing = 140;
    for (let i = 0; i < 3; i++) {
      const num = i + 1;
      const x = centerX - spacing + i * spacing - 30;
      extraShapes.push({
        type: 'circle',
        left: x, top: preset.numberingTop,
        radius: 22,
        fill: '{colors.accent}',
        opacity: 0.9,
        selectable: true,
        name: `[AI 데코] 넘버 ${num} 배경`,
      });
      extraTexts.push({
        binding: 'custom',
        customText: `0${num}`,
        left: x - 8, top: preset.numberingTop + 4,
        width: 60,
        fontSize: 18,
        fontWeight: 800,
        useHeadline: true,
        fill: '#FFFFFF',
        textAlign: 'center',
        name: `[AI 데코] 넘버 ${num}`,
      });
    }
  }

  // 5) 하단 아이콘 그리드 3개
  if (preset.showIconGrid && preset.iconNames.length >= 3) {
    const centerX = 430;
    const spacing = 140;
    for (let i = 0; i < 3; i++) {
      const x = centerX - spacing + i * spacing - 14;
      extraShapes.push({
        type: 'icon',
        left: x, top: preset.iconGridTop,
        iconName: preset.iconNames[i],
        iconSize: 28,
        fill: '{colors.accent}',
        opacity: 0.75,
        selectable: true,
        name: `[AI 데코] 아이콘 ${i + 1}`,
      });
    }
  }

  // 6) 상단 라벨 배경 하이라이트 바 (가독성용)
  extraShapes.push({
    type: 'rect',
    left: 40, top: 55,
    width: 180, height: 24,
    fill: '{colors.accent}',
    opacity: 0.1,
    rx: 4, ry: 4,
    selectable: true,
    name: '[AI 데코] 라벨 배경',
  });

  // 7) 상단 중앙 작은 구분 바 (섹션 시작 표시)
  extraShapes.push({
    type: 'rect',
    left: 420, top: 28,
    width: 20, height: 3,
    fill: '{colors.accent}',
    opacity: 0.6,
    selectable: true,
    name: '[AI 데코] 상단 구분',
  });

  return {
    ...template,
    shapes: [...template.shapes, ...extraShapes],
    textObjects: [...template.textObjects, ...extraTexts],
  };
}
