'use client';

import { Group, Rect, Text, Circle, Line } from 'react-konva';

// Color utility
function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

interface SectionProps {
  y: number;
  title: string;
  body: string;
  colors: { primary: string; accent: string; text: string };
  onSelect?: (id: string) => void;
  sectionId: string;
}

const W = 860;

// 1. Hero Section (height: 720)
export function HeroSection({ y, title, body, colors, sectionId, onSelect }: SectionProps & { productImageUrl?: string }) {
  return (
    <Group y={y} onClick={() => onSelect?.(sectionId)}>
      {/* Background gradient - dark primary */}
      <Rect width={W} height={720} fill={colors.primary} />
      {/* Lighter overlay circle */}
      <Circle x={W/2} y={-50} radius={400} fill={hexToRgba(colors.accent, 0.08)} />
      {/* Accent line */}
      <Rect x={W/2 - 30} y={420} width={60} height={3} fill={colors.accent} cornerRadius={2} />
      {/* Title */}
      <Text text={title || '제품명을 입력하세요'} x={80} y={440} width={700} fontSize={48} fontStyle="900" fontFamily="'Noto Sans KR', sans-serif" fill="#FFFFFF" align="center" draggable />
      {/* Body */}
      <Text text={body?.slice(0, 150) || '제품 설명을 입력하세요'} x={130} y={550} width={600} fontSize={17} fontFamily="'Noto Sans KR', sans-serif" fill="rgba(255,255,255,0.8)" align="center" lineHeight={1.8} draggable />
      {/* Product image placeholder */}
      <Rect x={W/2 - 120} y={100} width={240} height={280} fill="rgba(255,255,255,0.08)" cornerRadius={20} stroke="rgba(255,255,255,0.15)" strokeWidth={2} draggable />
      <Text text="제품 이미지" x={W/2 - 60} y={220} fontSize={14} fill="rgba(255,255,255,0.3)" />
    </Group>
  );
}

// 2. Problem Section (height: 560)
export function ProblemSection({ y, title, body, colors, sectionId, onSelect }: SectionProps) {
  const painPoints = (body || '고민 1\n고민 2\n고민 3').split('\n').filter(l => l.trim()).slice(0, 3);
  const cardW = 240, cardH = 200, gap = 15;
  const startX = (W - (cardW * 3 + gap * 2)) / 2;

  return (
    <Group y={y} onClick={() => onSelect?.(sectionId)}>
      <Rect width={W} height={560} fill="#F8F9FA" />
      {/* Accent line */}
      <Rect x={W/2 - 20} y={40} width={40} height={3} fill={colors.accent} cornerRadius={2} />
      {/* Title */}
      <Text text={title || '이런 고민, 공감되시나요?'} x={80} y={60} width={700} fontSize={36} fontStyle="900" fontFamily="'Noto Sans KR', sans-serif" fill="#191F28" align="center" draggable />
      {/* 3 cards */}
      {painPoints.map((point, i) => {
        const x = startX + i * (cardW + gap);
        const cy = 160;
        return (
          <Group key={i}>
            {/* Card bg */}
            <Rect x={x} y={cy} width={cardW} height={cardH} fill="#FFFFFF" cornerRadius={16} shadowColor="rgba(0,0,0,0.06)" shadowBlur={20} shadowOffsetY={4} />
            {/* Icon circle */}
            <Circle x={x + cardW/2} y={cy + 50} radius={24} fill={hexToRgba(colors.accent, 0.12)} />
            <Text text="!" x={x + cardW/2 - 6} y={cy + 38} fontSize={22} fontStyle="bold" fill={colors.accent} />
            {/* Pain point text */}
            <Text text={point.trim()} x={x + 20} y={cy + 90} width={cardW - 40} fontSize={14} fontFamily="'Noto Sans KR', sans-serif" fill="#4E5968" align="center" lineHeight={1.7} draggable />
          </Group>
        );
      })}
    </Group>
  );
}

// 3. Features Section (height: 600)
export function FeaturesSection({ y, title, body, colors, sectionId, onSelect }: SectionProps) {
  const items = (body || '특장점 1\n특장점 2\n특장점 3').split('\n').filter(l => l.trim()).slice(0, 4);
  const cols = items.length <= 3 ? 3 : 2;
  const rows = Math.ceil(items.length / cols);
  const cardW = cols === 3 ? 230 : 360;
  const cardH = 160;
  const gapX = 20, gapY = 15;
  const gridW = cols * cardW + (cols - 1) * gapX;
  const startX = (W - gridW) / 2;
  const startY = 140;

  return (
    <Group y={y} onClick={() => onSelect?.(sectionId)}>
      <Rect width={W} height={600} fill={colors.primary} />
      {/* Accent line */}
      <Rect x={W/2 - 20} y={40} width={40} height={3} fill="rgba(255,255,255,0.4)" cornerRadius={2} />
      {/* Title */}
      <Text text={title || '핵심 특장점'} x={80} y={60} width={700} fontSize={36} fontStyle="900" fontFamily="'Noto Sans KR', sans-serif" fill="#FFFFFF" align="center" draggable />
      {/* Cards */}
      {items.map((item, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (cardW + gapX);
        const cy = startY + row * (cardH + gapY);
        return (
          <Group key={i}>
            <Rect x={x} y={cy} width={cardW} height={cardH} fill="rgba(255,255,255,0.08)" cornerRadius={16} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
            {/* Number circle */}
            <Circle x={x + cardW/2} y={cy + 40} radius={24} fill={colors.accent} />
            <Text text={`0${i + 1}`} x={x + cardW/2 - 14} y={cy + 26} fontSize={22} fontStyle="900" fill="#FFFFFF" />
            {/* Feature text */}
            <Text text={item.trim()} x={x + 15} y={cy + 80} width={cardW - 30} fontSize={14} fontFamily="'Noto Sans KR', sans-serif" fill="rgba(255,255,255,0.85)" align="center" lineHeight={1.6} draggable />
          </Group>
        );
      })}
    </Group>
  );
}

// 4. Solution Section (height: 580)
export function SolutionSection({ y, title, body, colors, sectionId, onSelect }: SectionProps) {
  return (
    <Group y={y} onClick={() => onSelect?.(sectionId)}>
      <Rect width={W} height={580} fill="#FFFFFF" />
      <Rect x={W/2 - 20} y={40} width={40} height={3} fill={colors.accent} cornerRadius={2} />
      <Text text={title || '솔루션'} x={80} y={60} width={700} fontSize={36} fontStyle="900" fontFamily="'Noto Sans KR', sans-serif" fill="#191F28" align="center" draggable />
      <Text text={body?.slice(0, 200) || '제품이 어떻게 문제를 해결하는지'} x={130} y={130} width={600} fontSize={15} fontFamily="'Noto Sans KR', sans-serif" fill="#4E5968" align="center" lineHeight={1.9} draggable />
      {/* Product placeholder */}
      <Rect x={W/2 - 140} y={250} width={280} height={260} fill={hexToRgba(colors.primary, 0.05)} cornerRadius={24} draggable />
      <Text text="제품 이미지" x={W/2 - 50} y={370} fontSize={14} fill="#8B95A1" />
      {/* Check points */}
      {['즉각적인 효과', '안전한 성분', '지속되는 결과'].map((cp, i) => (
        <Group key={i}>
          <Circle x={240 + i * 160} y={540} radius={14} fill={colors.accent} />
          <Text text="✓" x={234 + i * 160} y={530} fontSize={16} fontStyle="bold" fill="#FFFFFF" />
          <Text text={cp} x={200 + i * 160} y={560} width={80} fontSize={11} fill="#191F28" align="center" fontStyle="bold" fontFamily="'Noto Sans KR', sans-serif" />
        </Group>
      ))}
    </Group>
  );
}

// 5. Specs Section (height: 480)
export function SpecsSection({ y, title, body, colors, sectionId, onSelect }: SectionProps) {
  const specs = (body || '용량: -\n성분: -\n원산지: -\n유통기한: -').split('\n').filter(l => l.trim()).slice(0, 6);
  const tableW = 600, rowH = 44;
  const tableX = (W - tableW) / 2;
  const tableY = 120;

  return (
    <Group y={y} onClick={() => onSelect?.(sectionId)}>
      <Rect width={W} height={480} fill="#FFFFFF" />
      <Rect x={W/2 - 20} y={40} width={40} height={3} fill={colors.accent} cornerRadius={2} />
      <Text text={title || '제품 상세 스펙'} x={80} y={60} width={700} fontSize={32} fontStyle="900" fontFamily="'Noto Sans KR', sans-serif" fill="#191F28" align="center" draggable />
      {/* Table */}
      <Rect x={tableX} y={tableY} width={tableW} height={specs.length * rowH} cornerRadius={12} stroke="#E5E8EB" strokeWidth={1} />
      {specs.map((spec, i) => {
        const [label, value] = spec.includes(':') ? spec.split(':').map(s => s.trim()) : [spec, '-'];
        const ry = tableY + i * rowH;
        return (
          <Group key={i}>
            {i % 2 === 0 && <Rect x={tableX} y={ry} width={tableW} height={rowH} fill="#FAFBFC" cornerRadius={i === 0 ? 12 : i === specs.length - 1 ? 12 : 0} />}
            {i > 0 && <Line points={[tableX, ry, tableX + tableW, ry]} stroke="#E5E8EB" strokeWidth={1} />}
            <Text text={label} x={tableX + 24} y={ry + 13} fontSize={13} fontStyle="bold" fontFamily="'Noto Sans KR', sans-serif" fill="#191F28" />
            <Text text={value || '-'} x={tableX + 200} y={ry + 13} fontSize={13} fontFamily="'Noto Sans KR', sans-serif" fill="#4E5968" />
          </Group>
        );
      })}
    </Group>
  );
}

// 6. CTA Section (height: 520)
export function CTASection({ y, title, body, colors, sectionId, onSelect }: SectionProps) {
  return (
    <Group y={y} onClick={() => onSelect?.(sectionId)}>
      <Rect width={W} height={520} fill={colors.primary} />
      {/* Decorative circles */}
      <Circle x={-60} y={520} radius={200} fill="rgba(255,255,255,0.03)" />
      <Circle x={W + 40} y={-40} radius={150} fill="rgba(255,255,255,0.03)" />
      {/* Title */}
      <Text text={title || '지금 시작하세요'} x={80} y={160} width={700} fontSize={42} fontStyle="900" fontFamily="'Noto Sans KR', sans-serif" fill="#FFFFFF" align="center" draggable />
      {/* Accent line */}
      <Rect x={W/2 - 30} y={230} width={60} height={3} fill={colors.accent} cornerRadius={2} />
      {/* Body */}
      <Text text={body?.slice(0, 120) || '특별한 혜택을 놓치지 마세요'} x={130} y={260} width={600} fontSize={17} fontFamily="'Noto Sans KR', sans-serif" fill="rgba(255,255,255,0.8)" align="center" lineHeight={1.8} draggable />
      {/* CTA Button */}
      <Rect x={W/2 - 160} y={360} width={320} height={64} fill={colors.accent} cornerRadius={32} shadowColor={hexToRgba(colors.accent, 0.3)} shadowBlur={24} shadowOffsetY={8} draggable />
      <Text text="지금 구매하기 →" x={W/2 - 160} y={380} width={320} fontSize={18} fontStyle="bold" fontFamily="'Noto Sans KR', sans-serif" fill="#FFFFFF" align="center" />
    </Group>
  );
}

// 7. Generic Section (fallback, height: 400)
export function GenericSection({ y, title, body, colors, sectionId, onSelect }: SectionProps & { bgWhite?: boolean }) {
  const bg = sectionId.includes('even') ? '#FFFFFF' : '#F8F9FA';
  return (
    <Group y={y} onClick={() => onSelect?.(sectionId)}>
      <Rect width={W} height={400} fill={bg} />
      <Rect x={W/2 - 20} y={40} width={40} height={3} fill={colors.accent} cornerRadius={2} />
      <Text text={title || '섹션 제목'} x={80} y={60} width={700} fontSize={32} fontStyle="900" fontFamily="'Noto Sans KR', sans-serif" fill="#191F28" align="center" draggable />
      <Text text={body?.slice(0, 300) || '섹션 내용을 입력하세요'} x={130} y={130} width={600} fontSize={15} fontFamily="'Noto Sans KR', sans-serif" fill="#4E5968" align="center" lineHeight={1.9} draggable />
    </Group>
  );
}

// Section height map
export const SECTION_HEIGHTS: Record<string, number> = {
  hooking: 720, hero: 720,
  problem: 560, solution: 580,
  features: 600, detail: 500,
  howto: 500, social_proof: 560,
  trust: 440, specs: 480,
  guarantee: 480, event_banner: 400,
  cta: 520,
};

export function getSectionHeight(type: string): number {
  return SECTION_HEIGHTS[type] || 400;
}
