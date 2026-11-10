// src/app/dashboard/loading.tsx
import React from "react";

export default function loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome Card Skeleton */}
      <div className="h-36 rounded-3xl bg-neutral-200" />

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-neutral-200" />
        ))}
      </div>

      {/* Split Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-44 rounded-3xl bg-neutral-200" />
        <div className="h-44 rounded-3xl bg-neutral-200" />
      </div>

      {/* Shortcuts Skeleton */}
      <div className="h-32 rounded-3xl bg-neutral-200" />
    </div>
  );
}
