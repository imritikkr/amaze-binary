"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleCheck, Sparkles } from "lucide-react";

export function ProfileCompletion({
  completionRate,
}: {
  completionRate: number;
}) {
  const percentage = Number.isFinite(completionRate)
    ? Math.min(100, Math.max(0, Math.round(completionRate)))
    : 0;

  const isComplete = percentage >= 100;

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const progress = (percentage / 100) * circumference;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#e5eae2] bg-white p-5 shadow-[0_4px_20px_rgba(28,51,36,0.045)] sm:p-6">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-[#eef3eb] opacity-70 blur-2xl" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        {/* Circular progress */}
        <div className="relative flex shrink-0 items-center justify-center self-center sm:self-auto">
          <svg
            viewBox="0 0 88 88"
            className="h-[100px] w-[100px] -rotate-90"
            role="img"
            aria-label={`Profile ${percentage}% complete`}
          >
            <circle
              cx="44"
              cy="44"
              r={radius}
              fill="none"
              stroke="#edf1e9"
              strokeWidth="7"
            />
            <circle
              cx="44"
              cy="44"
              r={radius}
              fill="none"
              stroke={isComplete ? "#55784c" : "#e8a020"}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              className="transition-all duration-700 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[23px] font-bold tracking-tight text-[#1c3324]">
              {percentage}%
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-[#879185]">
              Complete
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f5f0e5] text-[#b38327]">
              {isComplete ? <CircleCheck size={15} /> : <Sparkles size={15} />}
            </div>

            <h3 className="text-sm font-bold text-[#1c3324] sm:text-base">
              {isComplete
                ? "Your profile is complete!"
                : "Complete your profile"}
            </h3>

            {isComplete && (
              <span className="rounded-full bg-[#edf4e9] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#426644]">
                Completed
              </span>
            )}
          </div>

          <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-[#7d887b] sm:mx-0 sm:text-[13px]">
            {isComplete
              ? "Great work! Your personal, address and profile details are marked as complete."
              : "A complete profile helps keep your member information accurate. Add any remaining personal, address or bank details."}
          </p>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-[10px] font-medium">
              <span className="text-[#879185]">Profile progress</span>
              <span className="font-bold tabular-nums text-[#55784c]">
                {percentage} of 100
              </span>
            </div>

            <div
              className="h-2 w-full overflow-hidden rounded-full bg-[#edf1e9]"
              role="progressbar"
              aria-label="Profile completion"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percentage}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#55784c] to-[#e8a020] transition-all duration-700 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="shrink-0">
          {isComplete ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-[#e1eade] bg-[#f4f7f1] px-4 py-3 text-xs font-semibold text-[#426644] sm:flex-col sm:gap-1.5 sm:border-0 sm:bg-transparent">
              <CheckCircle2 size={19} />
              <span>All done</span>
            </div>
          ) : (
            <Link
              href="/dashboard/profile/edit"
              className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-5 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#2d4d38] hover:shadow-md sm:w-auto"
            >
              Complete profile
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
