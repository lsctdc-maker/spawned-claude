'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

const variantStyles: Record<string, string> = {
  primary: 'bg-[#1B2559] text-white font-semibold shadow-cta hover:bg-[#232D6B]',
  secondary: 'bg-[#F4F5F7] border border-[#E5E8EB] text-[#4E5968] hover:bg-[#E8EAED]',
  outline: 'border border-[#D1D6DB] text-[#4E5968] hover:bg-[#F4F5F7]',
  ghost: 'text-[#8B95A1] hover:bg-[#F4F5F7]',
  danger: 'bg-[#F04452] text-white',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, loading = false, disabled, children, className = '', type = 'button', ...props }, ref) => {
    const isDisabled = disabled || loading;
    return (
      <motion.button
        ref={ref}
        type={type}
        whileHover={isDisabled ? {} : { scale: 1.01 }}
        whileTap={isDisabled ? {} : { scale: 0.98 }}
        className={`
          inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl
          focus:outline-none focus:ring-2 focus:ring-[#3182F6]/20 focus:ring-offset-2 focus:ring-offset-white
          disabled:opacity-40 disabled:cursor-not-allowed
          ${variantStyles[variant]} ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''} ${className}
        `}
        disabled={isDisabled}
        {...(props as any)}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
