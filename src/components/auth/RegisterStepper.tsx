// src/components/auth/RegisterStepper.tsx
import React from "react";
import { Check } from "lucide-react";

interface StepperProps {
  currentStep: number;
}

export function RegisterStepper({ currentStep }: StepperProps) {
  const steps = [
    { number: 1, label: "Sponsor &\nPlacement" },
    { number: 2, label: "Your\nDetails" },
    { number: 3, label: "Verify &\nComplete" },
  ];

  return (
    <div className="w-full max-w-xs mx-auto py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-neutral-200 dark:bg-neutral-800 -z-0" />

        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <div key={step.number} className="flex flex-col items-center z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  isCompleted
                    ? "bg-purple-600 text-white"
                    : isCurrent
                      ? "bg-purple-600 text-white ring-4 ring-purple-100 dark:ring-purple-950"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  step.number
                )}
              </div>
              <span className="text-[10px] text-center mt-1.5 font-medium whitespace-pre-line text-neutral-500 dark:text-neutral-400 leading-tight">
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
