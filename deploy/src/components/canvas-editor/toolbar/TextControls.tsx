'use client';

import { useState, useEffect, useCallback } from 'react';
import { FONT_OPTIONS, loadGoogleFont } from '../utils/fontUtils';
import {
  Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  Strikethrough, Highlighter,
} from 'lucide-react';

interface TextControlsProps {
  fabricCanvas: React.MutableRefObject<any>;
  selectedObj: any;
}

export default function TextControls({ fabricCanvas, selectedObj }: TextControlsProps) {
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Noto Sans KR');
  const [fontWeight, setFontWeight] = useState<number>(400);
  const [fontStyle, setFontStyle] = useState<string>('normal');
  const [underline, setUnderline] = useState(false);
  const [linethrough, setLinethrough] = useState(false);
  const [textAlign, setTextAlign] = useState('left');
  const [fill, setFill] = useState('#ffffff');
  const [opacity, setOpacity] = useState(1);
  const [textBgColor, setTextBgColor] = useState('');
  const [charSpacing, setCharSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.4);

  // Sync from selected object
  useEffect(() => {
    if (!selectedObj) return;
    setFontSize(selectedObj.fontSize || 16);
    setFontFamily(selectedObj.fontFamily?.split(',')[0]?.replace(/'/g, '').trim() || 'Noto Sans KR');
    setFontWeight(Number(selectedObj.fontWeight) || 400);
    setFontStyle(selectedObj.fontStyle || 'normal');
    setUnderline(!!selectedObj.underline);
    setLinethrough(!!selectedObj.linethrough);
    setTextAlign(selectedObj.textAlign || 'left');
    setFill(selectedObj.fill || '#ffffff');
    setOpacity(selectedObj.opacity ?? 1);
    setTextBgColor(selectedObj.textBackgroundColor || '');
    setCharSpacing(selectedObj.charSpacing || 0);
    setLineHeight(selectedObj.lineHeight || 1.4);
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

  const handleWeightChange = useCallback((w: number) => {
    setFontWeight(w);
    updateObj({ fontWeight: w });
  }, [updateObj]);

  const toggleItalic = useCallback(() => {
    const next = fontStyle === 'italic' ? 'normal' : 'italic';
    setFontStyle(next);
    updateObj({ fontStyle: next });
  }, [fontStyle, updateObj]);

  const toggleUnderline = useCallback(() => {
    setUnderline(!underline);
    updateObj({ underline: !underline });
  }, [underline, updateObj]);

  const toggleLinethrough = useCallback(() => {
    setLinethrough(!linethrough);
    updateObj({ linethrough: !linethrough });
  }, [linethrough, updateObj]);

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

  const handleHighlightToggle = useCallback(() => {
    if (textBgColor) {
      setTextBgColor('');
      updateObj({ textBackgroundColor: '' });
    } else {
      // Use a yellow highlight by default
      setTextBgColor('rgba(255,230,0,0.35)');
      updateObj({ textBackgroundColor: 'rgba(255,230,0,0.35)' });
    }
  }, [textBgColor, updateObj]);

  const handleCharSpacingChange = useCallback((val: number) => {
    setCharSpacing(val);
    updateObj({ charSpacing: val });
  }, [updateObj]);

  const handleLineHeightChange = useCallback((val: number) => {
    setLineHeight(val);
    updateObj({ lineHeight: val });
  }, [updateObj]);

  if (!selectedObj || (selectedObj.type !== 'i-text' && selectedObj.type !== 'textbox')) {
    return null;
  }

  const isActive = (cond: boolean) =>
    cond ? 'bg-[#3182F6]/10 border-[#3182F6]/30 text-[#3182F6]' : 'border-[#E5E8EB] text-[#8B95A1] hover:text-[#191F28]';

  return (
    <div className="space-y-3">
      <div className="text-[9px] uppercase tracking-widest text-[#8B95A1] flex items-center gap-1.5">
        <Type className="w-3 h-3" />
        텍스트 편집
      </div>

      {/* Font family */}
      <select
        value={fontFamily}
        onChange={e => handleFontChange(e.target.value)}
        className="w-full bg-[#F4F5F7] text-[11px] text-[#4E5968] border border-[#E5E8EB] rounded-lg px-2 py-1.5 outline-none"
      >
        {FONT_OPTIONS.map(f => (
          <option key={f.value} value={f.value} className="bg-white">{f.label}</option>
        ))}
      </select>

      {/* Font size + style toggles */}
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={fontSize}
          onChange={e => handleSizeChange(Number(e.target.value))}
          min={8}
          max={120}
          className="w-14 bg-[#F4F5F7] text-[11px] text-[#4E5968] border border-[#E5E8EB] rounded-lg px-2 py-1.5 outline-none text-center"
        />
        <button onClick={() => handleWeightChange(fontWeight >= 700 ? 400 : 700)} className={`p-1.5 rounded-lg border transition-all ${isActive(fontWeight >= 700)}`} title="굵게">
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button onClick={toggleItalic} className={`p-1.5 rounded-lg border transition-all ${isActive(fontStyle === 'italic')}`} title="이탤릭">
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button onClick={toggleUnderline} className={`p-1.5 rounded-lg border transition-all ${isActive(underline)}`} title="밑줄">
          <Underline className="w-3.5 h-3.5" />
        </button>
        <button onClick={toggleLinethrough} className={`p-1.5 rounded-lg border transition-all ${isActive(linethrough)}`} title="취소선">
          <Strikethrough className="w-3.5 h-3.5" />
        </button>
        <button onClick={handleHighlightToggle} className={`p-1.5 rounded-lg border transition-all ${isActive(!!textBgColor)}`} title="하이라이트">
          <Highlighter className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-0.5 bg-[#F4F5F7] rounded-lg p-0.5 border border-[#E5E8EB]">
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
                ? 'bg-[#3182F6] text-white'
                : 'text-[#8B95A1] hover:text-[#191F28]'
            }`}
          >
            <Icon className="w-3.5 h-3.5 mx-auto" />
          </button>
        ))}
      </div>

      {/* Color + Opacity */}
      <div className="flex items-center gap-2">
        <label className="text-[9px] text-[#8B95A1]">색상</label>
        <input
          type="color"
          value={fill}
          onChange={e => handleColorChange(e.target.value)}
          className="w-7 h-7 rounded border border-[#E5E8EB] bg-transparent cursor-pointer"
        />
        <span className="text-[9px] text-[#8B95A1]">{fill}</span>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-[9px] text-[#8B95A1] w-10">투명도</label>
        <input
          type="range" min={0} max={1} step={0.05}
          value={opacity}
          onChange={e => handleOpacityChange(Number(e.target.value))}
          className="flex-1 h-1 appearance-none bg-[#E5E8EB] rounded-full accent-[#3182F6]"
        />
        <span className="text-[9px] text-[#8B95A1] w-8 text-right">{Math.round(opacity * 100)}%</span>
      </div>

      {/* Character Spacing */}
      <div className="flex items-center gap-2">
        <label className="text-[9px] text-[#8B95A1] w-10">자간</label>
        <input
          type="range" min={-100} max={500} step={10}
          value={charSpacing}
          onChange={e => handleCharSpacingChange(Number(e.target.value))}
          className="flex-1 h-1 appearance-none bg-[#E5E8EB] rounded-full accent-[#3182F6]"
        />
        <span className="text-[9px] text-[#8B95A1] w-8 text-right">{charSpacing}</span>
      </div>

      {/* Line Height */}
      <div className="flex items-center gap-2">
        <label className="text-[9px] text-[#8B95A1] w-10">행간</label>
        <input
          type="range" min={0.8} max={3} step={0.1}
          value={lineHeight}
          onChange={e => handleLineHeightChange(Number(e.target.value))}
          className="flex-1 h-1 appearance-none bg-[#E5E8EB] rounded-full accent-[#3182F6]"
        />
        <span className="text-[9px] text-[#8B95A1] w-8 text-right">{lineHeight.toFixed(1)}</span>
      </div>

      {/* Font Weight Slider */}
      <div className="flex items-center gap-2">
        <label className="text-[9px] text-[#8B95A1] w-10">굵기</label>
        <input
          type="range" min={300} max={900} step={100}
          value={fontWeight}
          onChange={e => handleWeightChange(Number(e.target.value))}
          className="flex-1 h-1 appearance-none bg-[#E5E8EB] rounded-full accent-[#3182F6]"
        />
        <span className="text-[9px] text-[#8B95A1] w-8 text-right">{fontWeight}</span>
      </div>
    </div>
  );
}
