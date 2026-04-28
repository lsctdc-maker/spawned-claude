'use client';

import { useRef, useState, useCallback } from 'react';

interface EditableTextProps {
  value: string;
  onChange?: (value: string) => void;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  placeholder?: string;
  style?: React.CSSProperties;
}

export default function EditableText({
  value,
  onChange,
  className = '',
  tag: Tag = 'div',
  placeholder = '클릭하여 편집',
  style,
}: EditableTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [editing, setEditing] = useState(false);

  const handleBlur = useCallback(() => {
    setEditing(false);
    if (ref.current && onChange) {
      const newText = ref.current.innerText;
      if (newText !== value) onChange(newText);
    }
  }, [onChange, value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditing(false);
      ref.current?.blur();
    }
  }, []);

  return (
    <Tag
      ref={ref as any}
      contentEditable
      suppressContentEditableWarning
      onFocus={() => setEditing(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`outline-none cursor-text transition-all ${
        editing
          ? 'ring-2 ring-blue-400/60 ring-offset-2 rounded-sm bg-white/10'
          : 'hover:ring-1 hover:ring-blue-300/30 hover:ring-offset-1 rounded-sm'
      } ${className}`}
      style={style}
      data-placeholder={placeholder}
    >
      {value || placeholder}
    </Tag>
  );
}
