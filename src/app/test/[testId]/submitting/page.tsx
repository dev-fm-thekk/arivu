"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function SubmissionLoadingPage() {
  const { testId } = useParams();
  const router = useRouter();

  useEffect(() => {
    // Deliberate 2.5 second animation loader before redirecting to the report
    const timer = setTimeout(() => {
      router.push(`/test/${testId}/report`);
    }, 2500);

    return () => clearTimeout(timer);
  }, [testId, router]);

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-full max-w-sm flex flex-col items-center">
        
        {/* Loading Spinner */}
        <div className="relative flex items-center justify-center mb-8 h-16 w-16">
          <span className="absolute h-16 w-16 rounded-full border-4 border-hairline" />
          <span className="absolute h-16 w-16 rounded-full border-4 border-primary-ink border-t-transparent animate-spin" />
        </div>

        <h1 className="text-2xl font-normal text-ink mb-2">
          Reviewing your answers...
        </h1>
        <p className="text-sm text-body">
          Hang tight while we calculate your results and compile your analytics.
        </p>

        {/* Support visuals: fading bar */}
        <div className="w-48 h-1.5 bg-surface-soft border border-hairline rounded-full overflow-hidden mt-6">
          <div className="h-full bg-primary-ink rounded-full animate-[loading-bar_2.5s_ease-in-out]" style={{ width: "100%" }} />
        </div>
      </div>
    </div>
  );
}
