import { SectionTemplate, ShapeObjectDef, TextObjectDef } from './types';
import { ManuscriptSectionType } from '@/lib/types';

/**
 * Phase 6-4: 구조적 디자인 레이어 시스템
 *
 * 실제 한국 상세페이지의 공통 디자인 언어:
 * - 포인트 카드 (rounded box + icon + number + text)
 * - 넘버링 배지 (01/02/03 원형)
 * - 리뷰 버블 (rounded speech bubble)
 * - 인증 배지 (gold ring circle)
 * - 스펙 테이블 (striped rows)
 * - 보증 실드 (center shield circle)
 * - CTA 버튼 (large rounded pill)
 *
 * 각 섹션 타입별로 의미있는 shape 컴포지션을 반환.
 * 기존 enrichTemplate의 "장식"과 달리 실제 페이지 구조를 만든다.
 *
 * 모든 shape은 selectable: true (사용자 편집/이동 가능)
 */

export interface StructuralLayers {
  shapes: ShapeObjectDef[];
  textObjects: TextObjectDef[];
  heightIncrease?: number; // 원본 canvasHeight 이상 필요할 경우
}

// === 섹션별 구성 함수 ===

function problemLayers(canvasHeight: number): StructuralLayers {
  // 3개의 페인 포인트 카드 (가로 배치)
  const cardTop = 280;
  const cardHeight = 240;
  const cardWidth = 245;
  const gap = 13;
  const leftStart = 60;

  const shapes: ShapeObjectDef[] = [];
  const textObjects: TextObjectDef[] = [];

  for (let i = 0; i < 3; i++) {
    const x = leftStart + i * (cardWidth + gap);

    // 1) 카드 배경 (흰색 + 그림자)
    shapes.push({
      type: 'rect',
      left: x, top: cardTop,
      width: cardWidth, height: cardHeight,
      fill: '#FFFFFF',
      rx: 16, ry: 16,
      stroke: 'rgba(0,0,0,0.08)',
      strokeWidth: 1,
      opacity: 0.98,
      selectable: true,
      name: `고민 카드 ${i + 1}`,
    });

    // 2) 아이콘 원형 배경
    const iconCenterX = x + 30;
    shapes.push({
      type: 'circle',
      left: iconCenterX - 22, top: cardTop + 28,
      radius: 22,
      fill: '{colors.accent}',
      opacity: 0.15,
      selectable: true,
      name: `아이콘 배경 ${i + 1}`,
    });

    // 3) 아이콘 (경고 / 문제)
    const iconNames = ['triangle-alert', 'circle-x', 'circle-help'];
    shapes.push({
      type: 'icon',
      left: iconCenterX - 11, top: cardTop + 39,
      iconName: iconNames[i],
      iconSize: 22,
      fill: '{colors.accent}',
      opacity: 1,
      selectable: true,
      name: `아이콘 ${i + 1}`,
    });

    // 4) 카드 내부 제목
    textObjects.push({
      binding: 'custom',
      customText: `고민 ${i + 1}`,
      left: x + 24, top: cardTop + 85,
      width: cardWidth - 48,
      fontSize: 18, fontWeight: 800,
      useHeadline: true,
      fill: '#191F28',
      textAlign: 'left',
      name: `카드 제목 ${i + 1}`,
    });

    // 5) 카드 내부 본문 placeholder
    textObjects.push({
      binding: 'custom',
      customText: '이런 경험, 있으시죠?\n\n클릭하여 내용을 입력하세요.',
      left: x + 24, top: cardTop + 124,
      width: cardWidth - 48,
      fontSize: 13, fontWeight: 400,
      useHeadline: false,
      fill: '#4E5968',
      textAlign: 'left',
      lineHeight: 1.6,
      name: `카드 설명 ${i + 1}`,
    });
  }

  return { shapes, textObjects, heightIncrease: cardTop + cardHeight + 60 > canvasHeight ? (cardTop + cardHeight + 60 - canvasHeight) : 0 };
}

function featuresLayers(canvasHeight: number): StructuralLayers {
  // 3개의 Point 카드 (넘버링 원형 + 제목 + 본문)
  const startTop = 240;
  const circleRadius = 32;
  const centerY = startTop;
  const colCenters = [175, 430, 685];

  const shapes: ShapeObjectDef[] = [];
  const textObjects: TextObjectDef[] = [];

  for (let i = 0; i < 3; i++) {
    const cx = colCenters[i];

    // 1) 넘버 원형 큰 배경
    shapes.push({
      type: 'circle',
      left: cx - circleRadius, top: centerY,
      radius: circleRadius,
      fill: '{colors.accent}',
      opacity: 1,
      selectable: true,
      name: `포인트 원 ${i + 1}`,
    });

    // 2) 넘버 텍스트 (01/02/03)
    textObjects.push({
      binding: 'custom',
      customText: `0${i + 1}`,
      left: cx - 30, top: centerY + 14,
      width: 60,
      fontSize: 26, fontWeight: 900,
      useHeadline: true,
      fill: '#FFFFFF',
      textAlign: 'center',
      name: `넘버 ${i + 1}`,
    });

    // 3) 카드 타이틀
    textObjects.push({
      binding: 'custom',
      customText: `POINT ${i + 1}`,
      left: cx - 120, top: centerY + circleRadius * 2 + 20,
      width: 240,
      fontSize: 18, fontWeight: 800,
      useHeadline: true,
      fill: '{colors.text}',
      textAlign: 'center',
      name: `포인트 제목 ${i + 1}`,
    });

    // 4) 카드 설명 placeholder
    textObjects.push({
      binding: 'custom',
      customText: '특장점을\n입력하세요',
      left: cx - 120, top: centerY + circleRadius * 2 + 56,
      width: 240,
      fontSize: 13, fontWeight: 400,
      useHeadline: false,
      fill: '{colors.text}',
      textAlign: 'center',
      lineHeight: 1.6,
      opacity: 0.8,
      name: `포인트 설명 ${i + 1}`,
    });

    // 5) 구분선 (카드 사이 - 2, 3번째만)
    if (i > 0) {
      shapes.push({
        type: 'rect',
        left: cx - 142, top: centerY + circleRadius,
        width: 1, height: 40,
        fill: '{colors.text}',
        opacity: 0.15,
        selectable: true,
        name: `구분선 ${i}`,
      });
    }
  }

  return { shapes, textObjects };
}

function socialProofLayers(canvasHeight: number): StructuralLayers {
  // 3개의 리뷰 버블 카드
  const cardTop = 260;
  const cardHeight = 220;
  const cardWidth = 245;
  const gap = 13;
  const leftStart = 60;

  const shapes: ShapeObjectDef[] = [];
  const textObjects: TextObjectDef[] = [];

  for (let i = 0; i < 3; i++) {
    const x = leftStart + i * (cardWidth + gap);

    // 1) 버블 배경 (둥근 카드)
    shapes.push({
      type: 'rect',
      left: x, top: cardTop,
      width: cardWidth, height: cardHeight,
      fill: '#FFFFFF',
      rx: 20, ry: 20,
      stroke: 'rgba(0,0,0,0.06)',
      strokeWidth: 1,
      opacity: 0.98,
      selectable: true,
      name: `리뷰 ${i + 1}`,
    });

    // 2) 별점 5개 (원형)
    for (let s = 0; s < 5; s++) {
      shapes.push({
        type: 'icon',
        left: x + 22 + s * 18, top: cardTop + 26,
        iconName: 'star',
        iconSize: 14,
        fill: '#F9A825',
        opacity: 1,
        selectable: true,
        name: `별점 ${i + 1}-${s + 1}`,
      });
    }

    // 3) 인용문
    textObjects.push({
      binding: 'custom',
      customText: '"정말 만족스러운 제품이에요.\n매일 사용하고 있습니다."',
      left: x + 22, top: cardTop + 64,
      width: cardWidth - 44,
      fontSize: 14, fontWeight: 500,
      useHeadline: false,
      fill: '#191F28',
      textAlign: 'left',
      lineHeight: 1.7,
      name: `리뷰 본문 ${i + 1}`,
    });

    // 4) 작성자
    textObjects.push({
      binding: 'custom',
      customText: `— 김**님 · ${20 + i * 5}대`,
      left: x + 22, top: cardTop + cardHeight - 36,
      width: cardWidth - 44,
      fontSize: 12, fontWeight: 600,
      useHeadline: false,
      fill: '{colors.accent}',
      textAlign: 'left',
      name: `작성자 ${i + 1}`,
    });
  }

  return { shapes, textObjects, heightIncrease: cardTop + cardHeight + 40 > canvasHeight ? (cardTop + cardHeight + 40 - canvasHeight) : 0 };
}

function trustLayers(canvasHeight: number): StructuralLayers {
  // 5-6개 인증 배지 (원형)
  const shapes: ShapeObjectDef[] = [];
  const textObjects: TextObjectDef[] = [];

  const badgeCount = 5;
  const badgeRadius = 40;
  const totalWidth = badgeCount * 100 + (badgeCount - 1) * 20;
  const startX = (860 - totalWidth) / 2;
  const badgeY = 260;

  const icons = ['shield', 'award', 'badge-check', 'leaf', 'check-circle'];

  for (let i = 0; i < badgeCount; i++) {
    const cx = startX + i * 120 + 50;

    // 1) 배지 원형 (외곽 골드 링)
    shapes.push({
      type: 'circle',
      left: cx - badgeRadius, top: badgeY,
      radius: badgeRadius,
      fill: '#FFFFFF',
      stroke: '#D4AF37',
      strokeWidth: 2,
      opacity: 1,
      selectable: true,
      name: `인증 ${i + 1} 외곽`,
    });

    // 2) 배지 내부 아이콘
    shapes.push({
      type: 'icon',
      left: cx - 18, top: badgeY + 22,
      iconName: icons[i],
      iconSize: 36,
      fill: '#D4AF37',
      opacity: 1,
      selectable: true,
      name: `인증 ${i + 1} 아이콘`,
    });

    // 3) 배지 하단 라벨
    textObjects.push({
      binding: 'custom',
      customText: `인증 ${i + 1}`,
      left: cx - 60, top: badgeY + badgeRadius * 2 + 16,
      width: 120,
      fontSize: 12, fontWeight: 700,
      useHeadline: true,
      fill: '{colors.text}',
      textAlign: 'center',
      letterSpacing: 2,
      name: `인증 라벨 ${i + 1}`,
    });
  }

  return { shapes, textObjects };
}

function howtoLayers(canvasHeight: number): StructuralLayers {
  // 4단계 스텝 (넘버 원 + 카드)
  const shapes: ShapeObjectDef[] = [];
  const textObjects: TextObjectDef[] = [];

  const stepCount = 4;
  const circleRadius = 28;
  const cardWidth = 170;
  const gap = 22;
  const totalWidth = stepCount * cardWidth + (stepCount - 1) * gap;
  const startX = (860 - totalWidth) / 2;
  const circleTop = 240;
  const cardTop = circleTop + circleRadius * 2 + 20;

  for (let i = 0; i < stepCount; i++) {
    const x = startX + i * (cardWidth + gap);
    const cx = x + cardWidth / 2;

    // 1) 넘버 원
    shapes.push({
      type: 'circle',
      left: cx - circleRadius, top: circleTop,
      radius: circleRadius,
      fill: '{colors.accent}',
      opacity: 1,
      selectable: true,
      name: `STEP ${i + 1} 원`,
    });

    // 2) 스텝 넘버
    textObjects.push({
      binding: 'custom',
      customText: `${i + 1}`,
      left: cx - 30, top: circleTop + 12,
      width: 60,
      fontSize: 26, fontWeight: 900,
      useHeadline: true,
      fill: '#FFFFFF',
      textAlign: 'center',
      name: `STEP ${i + 1} 넘버`,
    });

    // 3) 카드 배경
    shapes.push({
      type: 'rect',
      left: x, top: cardTop,
      width: cardWidth, height: 120,
      fill: 'rgba(255,255,255,0.95)',
      rx: 12, ry: 12,
      stroke: 'rgba(0,0,0,0.06)',
      strokeWidth: 1,
      opacity: 1,
      selectable: true,
      name: `STEP ${i + 1} 카드`,
    });

    // 4) 스텝 설명
    textObjects.push({
      binding: 'custom',
      customText: `STEP ${i + 1}\n사용 방법을\n입력하세요`,
      left: x + 12, top: cardTop + 18,
      width: cardWidth - 24,
      fontSize: 13, fontWeight: 500,
      useHeadline: false,
      fill: '#191F28',
      textAlign: 'center',
      lineHeight: 1.6,
      name: `STEP ${i + 1} 설명`,
    });

    // 5) 화살표 (마지막 빼고)
    if (i < stepCount - 1) {
      shapes.push({
        type: 'rect',
        left: x + cardWidth + 4, top: circleTop + circleRadius - 1,
        width: gap - 8, height: 2,
        fill: '{colors.accent}',
        opacity: 0.5,
        selectable: true,
        name: `화살표 ${i + 1}`,
      });
    }
  }

  return { shapes, textObjects };
}

function guaranteeLayers(canvasHeight: number): StructuralLayers {
  // 중앙 큰 실드 + 하단 3개 픽 포인트
  const shapes: ShapeObjectDef[] = [];
  const textObjects: TextObjectDef[] = [];

  const shieldCx = 430;
  const shieldCy = 220;
  const shieldRadius = 60;

  // 1) 큰 실드 외곽 원
  shapes.push({
    type: 'circle',
    left: shieldCx - shieldRadius, top: shieldCy - shieldRadius,
    radius: shieldRadius,
    fill: '{colors.accent}',
    opacity: 0.15,
    selectable: true,
    name: '보증 외곽',
  });

  // 2) 실드 내부 원
  shapes.push({
    type: 'circle',
    left: shieldCx - 44, top: shieldCy - 44,
    radius: 44,
    fill: '{colors.accent}',
    opacity: 1,
    selectable: true,
    name: '보증 배경',
  });

  // 3) 실드 아이콘
  shapes.push({
    type: 'icon',
    left: shieldCx - 22, top: shieldCy - 22,
    iconName: 'shield-check',
    iconSize: 44,
    fill: '#FFFFFF',
    opacity: 1,
    selectable: true,
    name: '보증 아이콘',
  });

  // 4) 하단 3개 픽 포인트 (pill 형태)
  const pillY = 340;
  const pillWidth = 220;
  const pillGap = 18;
  const totalPillWidth = 3 * pillWidth + 2 * pillGap;
  const pillStartX = (860 - totalPillWidth) / 2;

  const pillTexts = ['100% 환불 보증', '무료 교환', '24/7 고객지원'];

  for (let i = 0; i < 3; i++) {
    const x = pillStartX + i * (pillWidth + pillGap);

    shapes.push({
      type: 'rect',
      left: x, top: pillY,
      width: pillWidth, height: 52,
      fill: '#FFFFFF',
      rx: 26, ry: 26,
      stroke: '{colors.accent}',
      strokeWidth: 2,
      opacity: 1,
      selectable: true,
      name: `약속 ${i + 1}`,
    });

    textObjects.push({
      binding: 'custom',
      customText: pillTexts[i],
      left: x, top: pillY + 18,
      width: pillWidth,
      fontSize: 14, fontWeight: 700,
      useHeadline: true,
      fill: '{colors.accent}',
      textAlign: 'center',
      name: `약속 텍스트 ${i + 1}`,
    });
  }

  return { shapes, textObjects };
}

function specsLayers(canvasHeight: number): StructuralLayers {
  // 스펙 테이블 스타일 (alternating rows)
  const shapes: ShapeObjectDef[] = [];
  const textObjects: TextObjectDef[] = [];

  const tableLeft = 130;
  const tableWidth = 600;
  const rowHeight = 42;
  const startTop = 200;
  const rowCount = 6;

  const labels = ['용량', '성분', '원산지', '보관방법', '사용기한', '인증'];

  for (let i = 0; i < rowCount; i++) {
    const y = startTop + i * rowHeight;

    // 홀수 행 배경
    if (i % 2 === 0) {
      shapes.push({
        type: 'rect',
        left: tableLeft, top: y,
        width: tableWidth, height: rowHeight,
        fill: '{colors.accent}',
        opacity: 0.06,
        rx: 4, ry: 4,
        selectable: true,
        name: `테이블 행 ${i + 1}`,
      });
    }

    // 라벨 텍스트
    textObjects.push({
      binding: 'custom',
      customText: labels[i],
      left: tableLeft + 24, top: y + 12,
      width: 160,
      fontSize: 14, fontWeight: 700,
      useHeadline: true,
      fill: '{colors.text}',
      textAlign: 'left',
      name: `라벨 ${i + 1}`,
    });

    // 값 텍스트 (placeholder)
    textObjects.push({
      binding: 'custom',
      customText: '값을 입력하세요',
      left: tableLeft + 200, top: y + 12,
      width: tableWidth - 224,
      fontSize: 14, fontWeight: 400,
      useHeadline: false,
      fill: '{colors.text}',
      textAlign: 'left',
      opacity: 0.8,
      name: `값 ${i + 1}`,
    });
  }

  // 하단 구분선
  shapes.push({
    type: 'rect',
    left: tableLeft, top: startTop + rowCount * rowHeight,
    width: tableWidth, height: 2,
    fill: '{colors.accent}',
    opacity: 0.3,
    selectable: true,
    name: '테이블 하단선',
  });

  return { shapes, textObjects };
}

function ctaLayers(canvasHeight: number): StructuralLayers {
  // 가격 하이라이트 + 큰 CTA 버튼
  const shapes: ShapeObjectDef[] = [];
  const textObjects: TextObjectDef[] = [];

  const ctaY = canvasHeight - 140;
  const buttonWidth = 340;
  const buttonHeight = 68;
  const buttonX = (860 - buttonWidth) / 2;

  // 1) CTA 버튼 배경 (큰 pill)
  shapes.push({
    type: 'rect',
    left: buttonX, top: ctaY,
    width: buttonWidth, height: buttonHeight,
    fill: '{colors.accent}',
    rx: 34, ry: 34,
    opacity: 1,
    selectable: true,
    name: 'CTA 버튼',
  });

  // 2) CTA 텍스트
  textObjects.push({
    binding: 'custom',
    customText: '지금 구매하기 →',
    left: buttonX, top: ctaY + 22,
    width: buttonWidth,
    fontSize: 20, fontWeight: 800,
    useHeadline: true,
    fill: '#FFFFFF',
    textAlign: 'center',
    name: 'CTA 텍스트',
  });

  // 3) 버튼 위쪽 부가 텍스트 (가격 강조 영역)
  textObjects.push({
    binding: 'custom',
    customText: '한정 특가 진행 중',
    left: 0, top: ctaY - 44,
    width: 860,
    fontSize: 14, fontWeight: 700,
    useHeadline: true,
    fill: '{colors.accent}',
    textAlign: 'center',
    letterSpacing: 4,
    name: '프로모 라벨',
  });

  return { shapes, textObjects };
}

function hookingLayers(canvasHeight: number): StructuralLayers {
  // 히어로: 상단 라벨 pill + 하단 CTA 인디케이터
  const shapes: ShapeObjectDef[] = [];
  const textObjects: TextObjectDef[] = [];

  // 1) 상단 좌측 라벨 pill
  shapes.push({
    type: 'rect',
    left: 60, top: 60,
    width: 130, height: 32,
    fill: '#FFFFFF',
    rx: 16, ry: 16,
    opacity: 0.95,
    selectable: true,
    name: '상단 라벨',
  });

  textObjects.push({
    binding: 'custom',
    customText: 'NEW',
    left: 60, top: 69,
    width: 130,
    fontSize: 13, fontWeight: 800,
    useHeadline: true,
    fill: '{colors.accent}',
    textAlign: 'center',
    letterSpacing: 4,
    name: '라벨 텍스트',
  });

  // 2) 하단 스크롤 인디케이터 (작은 원)
  shapes.push({
    type: 'circle',
    left: 430 - 4, top: canvasHeight - 50,
    radius: 4,
    fill: '#FFFFFF',
    opacity: 0.7,
    selectable: true,
    name: '스크롤 점',
  });

  return { shapes, textObjects };
}

function solutionLayers(canvasHeight: number): StructuralLayers {
  // 솔루션: 좌측 강조 배지 + 우측 3개 픽 포인트
  const shapes: ShapeObjectDef[] = [];
  const textObjects: TextObjectDef[] = [];

  // 1) 좌측 "SOLUTION" 라벨 대신 - 작은 가로 바
  shapes.push({
    type: 'rect',
    left: 60, top: 90,
    width: 36, height: 4,
    fill: '{colors.accent}',
    opacity: 1,
    selectable: true,
    name: '섹션 표시 바',
  });

  // 2) 우측 3개 체크 포인트
  const checkTop = 240;
  const checks = ['즉각적인 효과', '안전한 성분', '지속되는 결과'];
  for (let i = 0; i < 3; i++) {
    const y = checkTop + i * 60;

    shapes.push({
      type: 'circle',
      left: 490, top: y,
      radius: 18,
      fill: '{colors.accent}',
      opacity: 1,
      selectable: true,
      name: `체크 원 ${i + 1}`,
    });

    shapes.push({
      type: 'icon',
      left: 498, top: y + 8,
      iconName: 'check',
      iconSize: 20,
      fill: '#FFFFFF',
      opacity: 1,
      selectable: true,
      name: `체크 아이콘 ${i + 1}`,
    });

    textObjects.push({
      binding: 'custom',
      customText: checks[i],
      left: 540, top: y + 10,
      width: 280,
      fontSize: 16, fontWeight: 600,
      useHeadline: true,
      fill: '{colors.text}',
      textAlign: 'left',
      name: `체크 텍스트 ${i + 1}`,
    });
  }

  return { shapes, textObjects };
}

function detailLayers(canvasHeight: number): StructuralLayers {
  // 스펙 콜아웃 박스 2-3개
  const shapes: ShapeObjectDef[] = [];
  const textObjects: TextObjectDef[] = [];

  const calloutsData = [
    { label: '함유량', value: '98%', top: 220 },
    { label: '만족도', value: '4.8★', top: 320 },
    { label: '추천', value: 'BEST', top: 420 },
  ];

  for (let i = 0; i < calloutsData.length; i++) {
    const { label, value, top } = calloutsData[i];

    // 콜아웃 박스
    shapes.push({
      type: 'rect',
      left: 600, top,
      width: 200, height: 80,
      fill: '{colors.accent}',
      rx: 12, ry: 12,
      opacity: 0.95,
      selectable: true,
      name: `콜아웃 ${i + 1} 박스`,
    });

    // 큰 숫자/값
    textObjects.push({
      binding: 'custom',
      customText: value,
      left: 600, top: top + 10,
      width: 200,
      fontSize: 28, fontWeight: 900,
      useHeadline: true,
      fill: '#FFFFFF',
      textAlign: 'center',
      name: `콜아웃 ${i + 1} 값`,
    });

    // 라벨
    textObjects.push({
      binding: 'custom',
      customText: label,
      left: 600, top: top + 50,
      width: 200,
      fontSize: 12, fontWeight: 600,
      useHeadline: false,
      fill: '#FFFFFF',
      textAlign: 'center',
      letterSpacing: 2,
      opacity: 0.9,
      name: `콜아웃 ${i + 1} 라벨`,
    });
  }

  return { shapes, textObjects };
}

function eventBannerLayers(canvasHeight: number): StructuralLayers {
  const shapes: ShapeObjectDef[] = [];
  const textObjects: TextObjectDef[] = [];

  // 좌측 큰 할인 배지 (원)
  shapes.push({
    type: 'circle',
    left: 60, top: 80,
    radius: 56,
    fill: '#FFFFFF',
    opacity: 0.95,
    selectable: true,
    name: '할인 배지',
  });

  textObjects.push({
    binding: 'custom',
    customText: '30%',
    left: 60, top: 110,
    width: 112,
    fontSize: 32, fontWeight: 900,
    useHeadline: true,
    fill: '{colors.accent}',
    textAlign: 'center',
    name: '할인율',
  });

  textObjects.push({
    binding: 'custom',
    customText: 'OFF',
    left: 60, top: 148,
    width: 112,
    fontSize: 14, fontWeight: 800,
    useHeadline: true,
    fill: '{colors.accent}',
    textAlign: 'center',
    letterSpacing: 4,
    name: '오프',
  });

  return { shapes, textObjects };
}

// === 메인 함수 ===

export function addStructuralLayers(template: SectionTemplate): SectionTemplate {
  let layers: StructuralLayers;

  switch (template.sectionType) {
    case 'problem':
      layers = problemLayers(template.canvasHeight);
      break;
    case 'features':
      layers = featuresLayers(template.canvasHeight);
      break;
    case 'social_proof':
      layers = socialProofLayers(template.canvasHeight);
      break;
    case 'trust':
      layers = trustLayers(template.canvasHeight);
      break;
    case 'howto':
      layers = howtoLayers(template.canvasHeight);
      break;
    case 'guarantee':
      layers = guaranteeLayers(template.canvasHeight);
      break;
    case 'specs':
      layers = specsLayers(template.canvasHeight);
      break;
    case 'cta':
      layers = ctaLayers(template.canvasHeight);
      break;
    case 'hooking':
    case 'hero':
      layers = hookingLayers(template.canvasHeight);
      break;
    case 'solution':
      layers = solutionLayers(template.canvasHeight);
      break;
    case 'detail':
      layers = detailLayers(template.canvasHeight);
      break;
    case 'event_banner':
      layers = eventBannerLayers(template.canvasHeight);
      break;
    default:
      return template;
  }

  return {
    ...template,
    canvasHeight: template.canvasHeight + (layers.heightIncrease || 0),
    shapes: [...template.shapes, ...layers.shapes],
    textObjects: [...template.textObjects, ...layers.textObjects],
  };
}
