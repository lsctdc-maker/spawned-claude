'use client';

import { motion } from 'framer-motion';
import { STEP_LABELS } from '@/lib/constants';

interface StepLabel {
  step: number;
  label: string;
}

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  labels?: StepLabel[];
}

export default function ProgressBar({ currentStep, totalSteps, labels }: ProgressBarProps) {
  const effectiveLabels = labels ?? STEP_LABELS;
  const effectiveTotalSteps = totalSteps ?? effectiveLabels.length;
  const firstStep = effectiveLabels[0]?.step ?? 1;
  const lastStep = effectiveLabels[effectiveLabels.length - 1]?.step ?? effectiveTotalSteps;
  const activeWidth = lastStep > firstStep
    ? ((currentStep - firstStep) / (lastStep - firstStep)) * 100
    : 0;

  return (
    <div className="w-full">
      <div className="relative flex justify-between items-center mb-2">
        <div className="absolute top-1/2 left-0 w-full stepper-line -translate-y-1/2 z-0" />
        <motion.div
          className="absolute top-1/2 left-0 stepper-line-active -translate-y-1/2 z-0"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(activeWidth, 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
        {effectiveLabels.map(({ step, label }, idx) => {
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          const displayNum = idx + 1;
          return (
            <div key={step} className="relative z-10 flex flex-col items-center gap-1">
              <motion.div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-medium text-xs transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#c3c0ff] text-[#0f0069]'
                    : isActive
                    ? 'bg-[#c3c0ff] text-[#0f0069] shadow-[0_0_14px_rgba(195,192,255,0.4)]'
                    : 'bg-[#2a2a2a] border border-[#464555]/30 text-[#e5e2e1]/50'
                }`}
                animate={isActive ? { y: [0, -2, 0] } : {}}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                {isCompleted ? '✓' : displayNum}
              </motion.div>
              <span className={`text-[10px] font-medium hidden sm:block ${
                isActive ? 'text-[#c3c0ff] font-semibold' : isCompleted ? 'text-[#c3c0ff]/70' : 'text-[#e5e2e1]/40'
              }`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
