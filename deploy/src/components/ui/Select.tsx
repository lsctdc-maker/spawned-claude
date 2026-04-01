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
          <label htmlFor={selectId} className="block text-sm text-[#8B95A1] mb-2 font-medium">{label}</label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full bg-transparent border-0 border-b-2 transition-all duration-200 appearance-none
            py-3 px-1 text-[#191F28]
            focus:outline-none focus:ring-0
            ${error ? 'border-[#F04452]' : 'border-[#E5E8EB] focus:border-[#3182F6]'}
            ${className}
          `}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238B95A1' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
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
        {error && <p className="mt-2 text-sm text-[#F04452]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
