import React from "react";

interface CircularProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export function CircularProgressRing({
  percentage,
  size = 180,
  strokeWidth = 12,
  label,
  sublabel,
}: CircularProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  // Color selection based on percentage
  let strokeColor = "stroke-error";
  if (percentage >= 70) {
    strokeColor = "stroke-success";
  } else if (percentage >= 40) {
    strokeColor = "stroke-signature-mustard";
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            className="stroke-surface-strong"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Foreground progress circle */}
          <circle
            className={`transition-all duration-1000 ease-out ${strokeColor}`}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-normal text-ink tracking-tight">
            {percentage}%
          </span>
          {label && (
            <span className="text-xs font-semibold text-muted tracking-wider uppercase mt-1">
              {label}
            </span>
          )}
          {sublabel && (
            <span className="text-[10px] text-muted font-medium mt-0.5">
              {sublabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
