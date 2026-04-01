'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || label?.replace(/\s/g, '-').toLowerCase();
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm text-[#8B95A1] mb-2 font-medium">{label}</label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full bg-transparent border-0 border-b-2 transition-all duration-200
            py-3 px-1 text-lg text-[#191F28] placeholder:text-[#D1D6DB]
            focus:outline-none focus:ring-0
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

Input.displayName = 'Input';
export default Input;
