'use client';

import { motion } from 'framer-motion';
import { STEP_LABELS } from '@/lib/constants';

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

export default function ProgressBar({ currentStep, totalSteps = 5 }: ProgressBarProps) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full">
      {/* 스텝 라벨 */}
      <div className="flex justify-between mb-3">
        {STEP_LABELS.map(({ step, label, icon }) => {
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;

          return (
            <div
              key={step}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                isActive ? 'scale-110' : ''
              }`}
            >
              <motion.div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg
                  transition-all duration-300 border-2
                  ${
                    isCompleted
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : isActive
                      ? 'bg-white border-primary-600 text-primary-600 shadow-lg shadow-primary-200'
                      : 'bg-gray-50 border-gray-200 text-gray-400'
                  }
                `}
                animate={isActive ? { y: [0, -3, 0] } : {}}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                {isCompleted ? '✓' : icon}
              </motion.div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  isActive
                    ? 'text-primary-600'
                    : isCompleted
                    ? 'text-primary-500'
                    : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* 진행 바 */}
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}
