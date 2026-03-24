'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const textAreaId = id || label?.replace(/\s/g, '-').toLowerCase();
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textAreaId} className="block text-[10px] uppercase tracking-widest text-[#e5e2e1]/50 mb-3 ml-1 font-label">{label}</label>
        )}
        <textarea
          ref={ref}
          id={textAreaId}
          className={`
            w-full bg-[#1c1b1b] border-0 border-b transition-all duration-300
            py-4 px-2 text-[#e5e2e1] placeholder:text-[#e5e2e1]/20
            focus:outline-none focus:ring-0 resize-y min-h-[100px]
            ${error ? 'border-[#ffb4ab] focus:border-[#ffb4ab]' : 'border-[#464555]/20 focus:border-[#c3c0ff]'}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-2 text-sm text-[#ffb4ab]">{error}</p>}
        {hint && !error && <p className="mt-2 text-sm text-[#e5e2e1]/40">{hint}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
export default TextArea;
