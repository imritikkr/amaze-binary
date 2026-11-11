"use client";

import React from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface StepperProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: "Sponsor & Placement" },
  { number: 2, label: "Your Details" },
];

export function RegisterStepper({ currentStep }: StepperProps) {
  const activeStep = Math.min(Math.max(currentStep, 1), 2);
  const progress = activeStep === 2 ? 100 : 0;

  return (
    <div className="w-full px-2 py-3">
      <div className="relative">
        <div className="absolute left-[25%] right-[25%] top-4 h-[2px] bg-[#e8ece5]">
          <motion.div
            className="h-full bg-[#1c3324]"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div className="relative grid grid-cols-2">
          {steps.map((step) => {
            const completed = activeStep > step.number;
            const current = activeStep === step.number;

            return (
              <div key={step.number} className="flex flex-col items-center">
                <div
                  className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all sm:h-9 sm:w-9 ${
                    completed
                      ? "border-[#1c3324] bg-[#1c3324] text-white"
                      : current
                        ? "border-[#1c3324] bg-white text-[#1c3324] ring-4 ring-[#1c3324]/10"
                        : "border-[#e5e9e2] bg-white text-[#a4ada1]"
                  }`}
                >
                  {completed ? (
                    <Check size={16} strokeWidth={3} />
                  ) : (
                    <span className="text-xs font-bold">{step.number}</span>
                  )}
                </div>

                <p
                  className={`mt-3 text-center text-[10px] font-semibold sm:text-xs ${
                    current || completed ? "text-[#1c3324]" : "text-[#a4ada1]"
                  }`}
                >
                  {step.label}
                </p>

                {current && (
                  <span className="mt-1 text-[8px] font-bold uppercase tracking-wider text-[#b17c24]">
                    Current
                  </span>
                )}

                {completed && (
                  <span className="mt-1 text-[8px] font-bold uppercase tracking-wider text-[#55784c]">
                    Completed
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
