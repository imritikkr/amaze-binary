// src/components/auth/PasswordStrength.tsx
"use client";

import React from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password?: string;
}

export function PasswordStrength({ password = "" }: PasswordStrengthProps) {
  const rules = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    {
      label: "At least one uppercase letter (A-Z)",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "At least one lowercase letter (a-z)",
      valid: /[a-z]/.test(password),
    },
    { label: "At least one number (0-9)", valid: /[0-9]/.test(password) },
    {
      label: "At least one special character (!@#$...)",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const score = rules.filter((r) => r.valid).length;
  const colors = [
    "bg-neutral-200",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-emerald-500",
  ];

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <div
            key={lvl}
            className={`flex-1 rounded-full transition-all duration-300 ${
              score >= lvl
                ? colors[score]
                : "bg-neutral-200 dark:bg-neutral-800"
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-1 text-[11px] text-neutral-500">
        {rules.map((rule, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            {rule.valid ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
            ) : (
              <X className="w-3.5 h-3.5 text-neutral-400" />
            )}
            <span
              className={
                rule.valid
                  ? "text-emerald-700 dark:text-emerald-400 font-medium"
                  : ""
              }
            >
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
