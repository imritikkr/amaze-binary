import React from "react";
import { Check } from "lucide-react";

interface StepperProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: "Sponsor & Placement" },
  { number: 2, label: "Your Details" },
  { number: 3, label: "Verify & Complete" },
];

export function RegisterStepper({ currentStep }: StepperProps) {
  const progress = ((Math.min(Math.max(currentStep, 1), 3) - 1) / 2) * 100;

  return (
    <div className="mx-auto w-full max-w-lg px-2 py-5 sm:px-4 sm:py-6">
      <div className="relative">
        {/* Progress track */}
        <div className="absolute left-[16.66%] right-[16.66%] top-5 h-[3px] -translate-y-1/2 rounded-full bg-[#e8e9e2]">
          <div
            className="h-full rounded-full bg-[#1c3324] transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex items-start justify-between">
          {steps.map((step) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            const isActive = isCompleted || isCurrent;

            return (
              <div
                key={step.number}
                className="z-10 flex w-1/3 flex-col items-center"
              >
                {/* Step circle */}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-[3px] transition-all duration-300 sm:h-11 sm:w-11 ${
                    isCompleted
                      ? "border-[#1c3324] bg-[#1c3324] text-white"
                      : isCurrent
                        ? "border-[#1c3324] bg-white text-[#1c3324] shadow-[0_0_0_5px_rgba(28,51,36,0.09)]"
                        : "border-[#e4e6df] bg-white text-[#a4a99f]"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 stroke-[3]" />
                  ) : (
                    <span className="text-sm font-bold">{step.number}</span>
                  )}
                </div>

                {/* Label */}
                <div className="mt-3 text-center">
                  <p
                    className={`text-[10px] font-semibold leading-tight transition-colors sm:text-xs ${
                      isActive ? "text-[#1c3324]" : "text-[#9a9f94]"
                    }`}
                  >
                    {step.label}
                  </p>

                  {isCurrent && (
                    <span className="mt-1.5 inline-block rounded-full bg-[#f7edda] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#a66b12] sm:text-[9px]">
                      Current
                    </span>
                  )}
                  {isCompleted && (
                    <span className="mt-1.5 inline-block text-[8px] font-semibold uppercase tracking-wider text-[#66816b] sm:text-[9px]">
                      Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
