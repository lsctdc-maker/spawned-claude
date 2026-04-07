'use client';

import { useCallback } from 'react';
import { Sparkles } from 'lucide-react';

interface TextPresetsProps {
  fabricCanvas: React.MutableRefObject<any>;
  selectedObj: any;
  accentColor?: string;
}

const PRESETS = [
  { label: '대제목', fontSize: 48, fontWeight: 900, fill: '#1a1a1a', letterSpacing: -10, lineHeight: 1.2 },
  { label: '부제목', fontSize: 24, fontWeight: 700, fill: '#333333', letterSpacing: 0, lineHeight: 1.4 },
  { label: '본문', fontSize: 15, fontWeight: 400, fill: '#555555', letterSpacing: 0, lineHeight: 1.8 },
  { label: '강조', fontSize: 20, fontWeight: 800, fill: 'ACCENT', letterSpacing: 0, lineHeight: 1.4 },
  { label: '캡션', fontSize: 11, fontWeight: 500, fill: '#999999', letterSpacing: 30, lineHeight: 1.5 },
  { label: '하이라이트', fontSize: 20, fontWeight: 800, fill: '#FFFFFF', letterSpacing: 0, lineHeight: 1.4, textBackgroundColor: 'ACCENT' },
];

export default function TextPresets({ fabricCanvas, selectedObj, accentColor }: TextPresetsProps) {
  const applyPreset = useCallback((preset: typeof PRESETS[0]) => {
    const canvas = fabricCanvas.current;
    if (!canvas || !selectedObj) return;

    const accent = accentColor || '#3182F6';
    const props: Record<string, any> = {
      fontSize: preset.fontSize,
      fontWeight: preset.fontWeight,
      fill: preset.fill === 'ACCENT' ? accent : preset.fill,
      charSpacing: preset.letterSpacing,
      lineHeight: preset.lineHeight,
    };

    if ('textBackgroundColor' in preset) {
      props.textBackgroundColor = preset.textBackgroundColor === 'ACCENT' ? accent : preset.textBackgroundColor;
    } else {
      props.textBackgroundColor = '';
    }

    selectedObj.set(props);
    canvas.renderAll();
    canvas.fire('object:modified', { target: selectedObj });
  }, [fabricCanvas, selectedObj, accentColor]);

  if (!selectedObj || (selectedObj.type !== 'i-text' && selectedObj.type !== 'textbox')) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="text-[9px] uppercase tracking-widest text-[#8B95A1] flex items-center gap-1.5">
        <Sparkles className="w-3 h-3" />
        텍스트 스타일
      </div>
      <div className="grid grid-cols-3 gap-1">
        {PRESETS.map(preset => (
          <button
            key={preset.label}
            onClick={() => applyPreset(preset)}
            className="px-2 py-1.5 text-[10px] font-medium text-[#4E5968] bg-[#F4F5F7] border border-[#E5E8EB] rounded-lg hover:border-[#3182F6]/30 hover:bg-[#3182F6]/5 transition-all"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
