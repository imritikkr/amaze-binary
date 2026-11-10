// src/app/dashboard/profile/loading.tsx
import React from "react";

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12 animate-pulse font-sora">
      {/* Header Skeleton */}
      <div className="rounded-2xl border border-[#e8e8df] bg-white p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5">
        <div className="h-28 w-28 rounded-2xl bg-[#f3f5ef] shrink-0" />
        <div className="flex-1 space-y-3 w-full">
          <div className="h-6 w-48 rounded bg-[#f3f5ef]" />
          <div className="h-4 w-32 rounded bg-[#f3f5ef]" />
          <div className="h-3 w-64 rounded bg-[#f3f5ef]" />
        </div>
      </div>

      {/* Completion Bar Skeleton */}
      <div className="rounded-2xl border border-[#e8e8df] bg-white p-5 shadow-sm space-y-3">
        <div className="h-4 w-36 rounded bg-[#f3f5ef]" />
        <div className="h-2 w-full rounded-full bg-[#f3f5ef]" />
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[#e8e8df] bg-white p-6 shadow-sm space-y-4">
          <div className="h-4 w-40 rounded bg-[#f3f5ef]" />
          <div className="space-y-3 pt-2">
            <div className="h-3 w-full rounded bg-[#f3f5ef]" />
            <div className="h-3 w-3/4 rounded bg-[#f3f5ef]" />
            <div className="h-3 w-5/6 rounded bg-[#f3f5ef]" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#e8e8df] bg-white p-6 shadow-sm space-y-4">
            <div className="h-4 w-36 rounded bg-[#f3f5ef]" />
            <div className="h-10 w-full rounded bg-[#f3f5ef]" />
          </div>
          <div className="rounded-2xl border border-[#e8e8df] bg-white p-6 shadow-sm space-y-4">
            <div className="h-4 w-36 rounded bg-[#f3f5ef]" />
            <div className="h-10 w-full rounded bg-[#f3f5ef]" />
          </div>
        </div>
      </div>
    </div>
  );
}
