'use client';

import { Check } from 'lucide-react';

interface StepItem {
  step: number;
  label: string;
}

interface VerticalStepperProps {
  steps: StepItem[];
  currentStep: number;
}

export default function VerticalStepper({ steps, currentStep }: VerticalStepperProps) {
  return (
    <div className="flex flex-col gap-0">
      {steps.map((s, idx) => {
        const isActive = s.step === currentStep;
        const isCompleted = s.step < currentStep;
        const isLast = idx === steps.length - 1;

        return (
          <div key={s.step} className="flex items-start gap-3">
            {/* Indicator column */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  isCompleted
                    ? 'bg-[#3182F6] text-white'
                    : isActive
                    ? 'border-2 border-[#3182F6] bg-white text-[#3182F6]'
                    : 'border-2 border-[#E5E8EB] bg-white text-[#D1D6DB]'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-bold">{idx + 1}</span>
                )}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 h-8 my-1 transition-colors ${
                    isCompleted ? 'bg-[#3182F6]' : 'bg-[#E5E8EB]'
                  }`}
                />
              )}
            </div>

            {/* Label */}
            <div className="pt-1.5">
              <span
                className={`text-sm transition-colors ${
                  isActive
                    ? 'font-bold text-[#191F28]'
                    : isCompleted
                    ? 'font-medium text-[#3182F6]'
                    : 'font-medium text-[#D1D6DB]'
                }`}
              >
                {s.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
