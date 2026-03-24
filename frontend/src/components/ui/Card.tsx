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
  const baseStyles = 'rounded-2xl transition-all duration-200';

  const variantStyles: Record<string, string> = {
    default: 'bg-white shadow-sm border border-gray-100',
    elevated: 'bg-white shadow-md hover:shadow-lg',
    bordered: `bg-white border-2 ${selected ? 'border-primary-500 shadow-md ring-2 ring-primary-100' : 'border-gray-200 hover:border-gray-300'}`,
    interactive: `bg-white border-2 cursor-pointer ${selected ? 'border-primary-500 shadow-md ring-2 ring-primary-100' : 'border-gray-200 hover:border-primary-300 hover:shadow-md'}`,
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
