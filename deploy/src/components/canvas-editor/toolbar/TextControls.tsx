'use client';

import { useState, useEffect, useCallback } from 'react';
import { FONT_OPTIONS, loadGoogleFont } from '../utils/fontUtils';
import {
  Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
} from 'lucide-react';

interface TextControlsProps {
  fabricCanvas: React.MutableRefObject<any>;
  selectedObj: any;
}

export default function TextControls({ fabricCanvas, selectedObj }: TextControlsProps) {
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Noto Sans KR');
  const [fontWeight, setFontWeight] = useState<string | number>(400);
  const [textAlign, setTextAlign] = useState('left');
  const [fill, setFill] = useState('#ffffff');
  const [opacity, setOpacity] = useState(1);

  // Sync from selected object
  useEffect(() => {
    if (!selectedObj) return;
    setFontSize(selectedObj.fontSize || 16);
    setFontFamily(selectedObj.fontFamily?.split(',')[0]?.replace(/'/g, '').trim() || 'Noto Sans KR');
    setFontWeight(selectedObj.fontWeight || 400);
    setTextAlign(selectedObj.textAlign || 'left');
    setFill(selectedObj.fill || '#ffffff');
    setOpacity(selectedObj.opacity ?? 1);
  }, [selectedObj]);

  const updateObj = useCallback((props: Record<string, any>) => {
    const canvas = fabricCanvas.current;
    if (!canvas || !selectedObj) return;
    selectedObj.set(props);
    canvas.renderAll();
    canvas.fire('object:modified', { target: selectedObj });
  }, [fabricCanvas, selectedObj]);

  const handleFontChange = useCallback((font: string) => {
    loadGoogleFont(font);
    setFontFamily(font);
    updateObj({ fontFamily: `${font}, Noto Sans KR, sans-serif` });
  }, [updateObj]);

  const handleSizeChange = useCallback((size: number) => {
    setFontSize(size);
    updateObj({ fontSize: size });
  }, [updateObj]);

  const handleWeightToggle = useCallback(() => {
    const newWeight = fontWeight === 700 || fontWeight === '700' || fontWeight === 'bold' ? 400 : 700;
    setFontWeight(newWeight);
    updateObj({ fontWeight: newWeight });
  }, [fontWeight, updateObj]);

  const handleAlignChange = useCallback((align: string) => {
    setTextAlign(align);
    updateObj({ textAlign: align });
  }, [updateObj]);

  const handleColorChange = useCallback((color: string) => {
    setFill(color);
    updateObj({ fill: color });
  }, [updateObj]);

  const handleOpacityChange = useCallback((val: number) => {
    setOpacity(val);
    updateObj({ opacity: val });
  }, [updateObj]);

  if (!selectedObj || (selectedObj.type !== 'i-text' && selectedObj.type !== 'textbox')) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="text-[9px] uppercase tracking-widest text-[#e5e2e1]/30 flex items-center gap-1.5">
        <Type className="w-3 h-3" />
        텍스트 편집
      </div>

      {/* Font family */}
      <select
        value={fontFamily}
        onChange={e => handleFontChange(e.target.value)}
        className="w-full bg-[#1c1b1b] text-[11px] text-[#c7c4d8] border border-[#464555]/20 rounded-lg px-2 py-1.5 outline-none"
      >
        {FONT_OPTIONS.map(f => (
          <option key={f.value} value={f.value} className="bg-[#1c1b1b]">{f.label}</option>
        ))}
      </select>

      {/* Font size + weight */}
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={fontSize}
          onChange={e => handleSizeChange(Number(e.target.value))}
          min={8}
          max={120}
          className="w-16 bg-[#1c1b1b] text-[11px] text-[#c7c4d8] border border-[#464555]/20 rounded-lg px-2 py-1.5 outline-none text-center"
        />
        <button
          onClick={handleWeightToggle}
          className={`p-1.5 rounded-lg border transition-all ${
            fontWeight === 700 || fontWeight === 'bold'
              ? 'bg-[#c3c0ff]/15 border-[#c3c0ff]/30 text-[#c3c0ff]'
              : 'border-[#464555]/20 text-[#e5e2e1]/40 hover:text-[#e5e2e1]'
          }`}
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-0.5 bg-[#1c1b1b] rounded-lg p-0.5 border border-[#464555]/20">
        {[
          { align: 'left', icon: AlignLeft },
          { align: 'center', icon: AlignCenter },
          { align: 'right', icon: AlignRight },
        ].map(({ align, icon: Icon }) => (
          <button
            key={align}
            onClick={() => handleAlignChange(align)}
            className={`flex-1 p-1.5 rounded text-center transition-all ${
              textAlign === align
                ? 'bg-[#c3c0ff] text-[#0f0069]'
                : 'text-[#e5e2e1]/40 hover:text-[#e5e2e1]'
            }`}
          >
            <Icon className="w-3.5 h-3.5 mx-auto" />
          </button>
        ))}
      </div>

      {/* Color */}
      <div className="flex items-center gap-2">
        <label className="text-[9px] text-[#c7c4d8]/50">색상</label>
        <input
          type="color"
          value={fill}
          onChange={e => handleColorChange(e.target.value)}
          className="w-7 h-7 rounded border border-[#464555]/20 bg-transparent cursor-pointer"
        />
        <span className="text-[9px] text-[#c7c4d8]/40">{fill}</span>
      </div>

      {/* Opacity */}
      <div className="flex items-center gap-2">
        <label className="text-[9px] text-[#c7c4d8]/50 w-10">투명도</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={opacity}
          onChange={e => handleOpacityChange(Number(e.target.value))}
          className="flex-1 h-1 appearance-none bg-[#464555]/30 rounded-full"
        />
        <span className="text-[9px] text-[#c7c4d8]/40 w-8 text-right">{Math.round(opacity * 100)}%</span>
      </div>
    </div>
  );
}
