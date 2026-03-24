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
          <label htmlFor={inputId} className="block text-xs uppercase tracking-widest text-[#e5e2e1]/50 mb-3 ml-1 font-label">{label}</label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full bg-[#1c1b1b] border-0 border-b transition-all duration-300
            py-4 px-2 text-lg text-[#e5e2e1] placeholder:text-[#e5e2e1]/20
            focus:outline-none focus:ring-0
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

Input.displayName = 'Input';
export default Input;
