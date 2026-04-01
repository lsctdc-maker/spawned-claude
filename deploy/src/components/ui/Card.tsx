'use client';

import { HTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'bordered' | 'interactive';
  padding?: 'sm' | 'md' | 'lg';
  selected?: boolean;
}

const paddingStyles: Record<string, string> = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  selected = false,
  className = '',
  onClick,
  ...props
}: CardProps) {
  const baseStyles = 'rounded-xl transition-all duration-200';

  const variantStyles: Record<string, string> = {
    default: 'bg-white border border-[#E5E8EB]',
    elevated: 'bg-white shadow-card',
    bordered: `${selected ? 'bg-[#EBF4FF] border-2 border-[#3182F6]' : 'bg-white border border-[#E5E8EB] hover:border-[#3182F6]'}`,
    interactive: `cursor-pointer ${selected ? 'bg-[#EBF4FF] border-2 border-[#3182F6]' : 'bg-white border border-[#E5E8EB] hover:border-[#3182F6] hover:shadow-card-hover'}`,
  };

  const Component = onClick ? motion.div : 'div';
  const motionProps = onClick
    ? { whileHover: { scale: 1.01 }, whileTap: { scale: 0.99 } }
    : {};

  return (
    <Component
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      onClick={onClick}
      {...motionProps}
      {...(props as any)}
    >
      {children}
    </Component>
  );
}
