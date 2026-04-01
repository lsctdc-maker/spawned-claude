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
          <label htmlFor={textAreaId} className="block text-sm text-[#8B95A1] mb-2 font-medium">{label}</label>
        )}
        <textarea
          ref={ref}
          id={textAreaId}
          className={`
            w-full bg-transparent border-0 border-b-2 transition-all duration-200
            py-3 px-1 text-[#191F28] placeholder:text-[#D1D6DB]
            focus:outline-none focus:ring-0 resize-y min-h-[100px]
            ${error ? 'border-[#F04452] focus:border-[#F04452]' : 'border-[#E5E8EB] focus:border-[#3182F6]'}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-2 text-sm text-[#F04452]">{error}</p>}
        {hint && !error && <p className="mt-2 text-sm text-[#8B95A1]">{hint}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
export default TextArea;
