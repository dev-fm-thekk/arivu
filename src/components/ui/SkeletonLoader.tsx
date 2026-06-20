import React from "react";

export function SkeletonCard() {
  return (
    <div className="card w-full p-6 animate-pulse border border-hairline bg-canvas rounded-md">
      <div className="h-4 w-1/4 rounded bg-surface-strong mb-4" />
      <div className="h-8 w-1/2 rounded bg-surface-strong mb-2" />
      <div className="h-4 w-5/6 rounded bg-surface-strong" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-6 animate-pulse border border-hairline bg-canvas rounded-md">
          <div className="h-3 w-1/3 rounded bg-surface-strong mb-3" />
          <div className="h-7 w-2/3 rounded bg-surface-strong" />
        </div>
      ))}
    </div>
  );
}
