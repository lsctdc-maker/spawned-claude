'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'td';
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
}

export default function EditableText({ value, onSave, tag: Tag = 'span', className = '', style, multiline = false }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (ref.current) {
      const newValue = multiline ? ref.current.innerText : ref.current.textContent || '';
      if (newValue !== value) {
        onSave(newValue);
      }
    }
  }, [value, onSave, multiline]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      ref.current?.blur();
    }
    if (e.key === 'Escape') {
      if (ref.current) {
        ref.current.textContent = value;
      }
      setIsEditing(false);
    }
  }, [value, multiline]);

  return (
    <Tag
      ref={ref as any}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onClick={handleClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${className} ${isEditing ? 'outline-none ring-1 ring-[#3182F6]/50 rounded px-1 bg-[#3182F6]/5' : ''} ${!isEditing && isHovered ? 'outline-dashed outline-1 outline-[#3182F6]/30 rounded cursor-text' : ''} transition-all relative`}
      style={style}
    >
      {value}
    </Tag>
  );
}
