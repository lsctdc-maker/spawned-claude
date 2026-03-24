'use client';

import { TextStyle } from '@/lib/types';

interface TextStyleBarProps {
  style: TextStyle;
  onChange: (style: TextStyle) => void;
}

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32];

export default function TextStyleBar({ style, onChange }: TextStyleBarProps) {
  return (
    <div className="flex items-center gap-4 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm mb-3">
      <span className="text-xs text-gray-400 font-medium whitespace-nowrap">텍스트 스타일</span>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400">크기</span>
        <select
          value={style.fontSize}
          onChange={(e) => onChange({ ...style, fontSize: Number(e.target.value) })}
          className="text-xs border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
        >
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>{size}px</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400">색상</span>
        <input
          type="color"
          value={style.color}
          onChange={(e) => onChange({ ...style, color: e.target.value })}
          className="w-7 h-7 rounded cursor-pointer border border-gray-300 p-0.5 bg-white"
          title="글자 색 선택"
        />
        <span className="text-xs text-gray-400 font-mono">{style.color}</span>
      </div>
    </div>
  );
}
