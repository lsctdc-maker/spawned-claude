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
      {/* Simple bar progress like Toss */}
      <div className="relative h-1 bg-[#E5E8EB] rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-[#3182F6] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(activeWidth, 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>
      {/* Step labels below */}
      <div className="flex justify-between mt-3">
        {effectiveLabels.map(({ step, label }, idx) => {
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          return (
            <div key={step} className="flex flex-col items-center gap-1">
              <span className={`text-xs font-medium ${
                isActive ? 'text-[#3182F6]' : isCompleted ? 'text-[#3182F6]/60' : 'text-[#D1D6DB]'
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
