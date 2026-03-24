'use client';

import { motion } from 'framer-motion';
import { STEP_LABELS } from '@/lib/constants';

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

export default function ProgressBar({ currentStep, totalSteps = 5 }: ProgressBarProps) {
  const activeWidth = totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="w-full">
      {/* Stepper */}
      <div className="relative flex justify-between items-center mb-4">
        {/* Background line */}
        <div className="absolute top-1/2 left-0 w-full stepper-line -translate-y-1/2 z-0" />
        {/* Active line */}
        <motion.div
          className="absolute top-1/2 left-0 stepper-line-active -translate-y-1/2 z-0"
          initial={{ width: 0 }}
          animate={{ width: `${activeWidth}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />

        {STEP_LABELS.map(({ step, label, icon }) => {
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;

          return (
            <div key={step} className="relative z-10 flex flex-col items-center gap-3">
              <motion.div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                  ${
                    isCompleted
                      ? 'bg-[#c3c0ff] text-[#0f0069]'
                      : isActive
                      ? 'bg-[#c3c0ff] text-[#0f0069] shadow-[0_0_20px_rgba(195,192,255,0.4)]'
                      : 'bg-[#2a2a2a] border border-[#464555]/30 text-[#e5e2e1]/50'
                  }
                `}
                animate={isActive ? { y: [0, -3, 0] } : {}}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                {isCompleted ? '✓' : icon}
              </motion.div>
              <span
                className={`text-sm font-medium hidden sm:block ${
                  isActive
                    ? 'text-[#c3c0ff] font-semibold'
                    : isCompleted
                    ? 'text-[#c3c0ff]/70'
                    : 'text-[#e5e2e1]/40'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
