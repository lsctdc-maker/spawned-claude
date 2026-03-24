'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder = '선택해주세요', className = '', id, ...props }, ref) => {
    const selectId = id || label?.replace(/\s/g, '-').toLowerCase();
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-[10px] uppercase tracking-widest text-[#e5e2e1]/50 mb-3 ml-1 font-label">{label}</label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full bg-[#1c1b1b] border-0 border-b transition-all duration-300 appearance-none
            py-4 px-2 text-[#e5e2e1]
            focus:outline-none focus:ring-0
            ${error ? 'border-[#ffb4ab]' : 'border-[#464555]/20 focus:border-[#c3c0ff]'}
            ${className}
          `}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23c7c4d8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.75rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem',
          }}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.icon ? `${option.icon} ${option.label}` : option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-2 text-sm text-[#ffb4ab]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
