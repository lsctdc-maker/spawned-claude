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
  const baseStyles = 'rounded-xl transition-all duration-300';

  const variantStyles: Record<string, string> = {
    default: 'bg-[#201f1f] border border-[#464555]/10',
    elevated: 'bg-[#201f1f] shadow-[0_10px_40px_rgba(229,226,225,0.05)]',
    bordered: `${selected ? 'bg-[#c3c0ff]/5 border border-[#c3c0ff]/40 shadow-[0_0_15px_rgba(195,192,255,0.1)]' : 'bg-[#2a2a2a] border border-[#464555]/15 hover:border-[#c3c0ff]/50'}`,
    interactive: `cursor-pointer ${selected ? 'bg-[#c3c0ff]/5 border border-[#c3c0ff]/40 shadow-[0_0_15px_rgba(195,192,255,0.1)]' : 'bg-[#2a2a2a] border border-[#464555]/15 hover:border-[#c3c0ff]/50 hover:bg-[#353534]'}`,
  };

  const Component = onClick ? motion.div : 'div';
  const motionProps = onClick
    ? { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 } }
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
