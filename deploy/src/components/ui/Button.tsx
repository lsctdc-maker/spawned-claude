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
  primary: 'primary-gradient text-[#0f0069] font-headline font-extrabold shadow-cta hover:scale-[1.02] active:scale-[0.98]',
  secondary: 'bg-[#2a2a2a] border border-[#464555]/20 text-[#e5e2e1] hover:bg-[#353534]',
  outline: 'border border-[#c3c0ff]/40 text-[#c3c0ff] hover:bg-[#c3c0ff]/10',
  ghost: 'text-[#c7c4d8] hover:bg-[#2a2a2a]',
  danger: 'bg-[#93000a] text-[#ffdad6]',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, loading = false, disabled, children, className = '', ...props }, ref) => {
    const isDisabled = disabled || loading;
    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? {} : { scale: 1.02 }}
        whileTap={isDisabled ? {} : { scale: 0.98 }}
        className={`
          inline-flex items-center justify-center font-medium transition-all duration-300 rounded-full
          focus:outline-none focus:ring-2 focus:ring-[#c3c0ff]/30 focus:ring-offset-2 focus:ring-offset-[#131313]
          disabled:opacity-50 disabled:cursor-not-allowed
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
