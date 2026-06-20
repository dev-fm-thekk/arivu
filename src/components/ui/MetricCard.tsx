import React from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isUp: boolean;
  };
  icon?: React.ReactNode;
}

export function MetricCard({ label, value, trend, icon }: MetricCardProps) {
  return (
    <div className="card flex flex-col justify-between p-6 bg-canvas border border-hairline rounded-md shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted tracking-wider uppercase">{label}</span>
        {icon && <div className="text-muted">{icon}</div>}
      </div>
      
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-normal text-ink tracking-tight">{value}</span>
        {trend && (
          <span 
            className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded ${
              trend.isUp 
                ? "bg-success/10 text-success" 
                : "bg-error/10 text-error"
            }`}
          >
            {trend.isUp ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
