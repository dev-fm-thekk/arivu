import React from "react";

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  averageValue?: number;
}

export function LineChart({ data, height = 240, averageValue }: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded border border-dashed border-hairline text-sm text-muted">
        No performance data available yet
      </div>
    );
  }

  const padding = 40;
  const chartHeight = height - padding * 2;
  
  // Find min/max values
  const maxVal = Math.max(...data.map(d => d.value), 100);
  const minVal = Math.min(...data.map(d => d.value), 0);
  const valueRange = maxVal - minVal;

  // We want X coordinates spread evenly
  const width = 600;
  const chartWidth = width - padding * 2;
  
  const points = data.map((d, index) => {
    const x = padding + (index / Math.max(data.length - 1, 1)) * chartWidth;
    const y = padding + chartHeight - ((d.value - minVal) / (valueRange || 1)) * chartHeight;
    return { x, y, ...d };
  });

  // SVG path definition
  let pathD = "";
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
  }

  // Average line Y
  let avgY: number | null = null;
  if (averageValue !== undefined) {
    avgY = padding + chartHeight - ((averageValue - minVal) / (valueRange || 1)) * chartHeight;
  }

  return (
    <div className="w-full bg-canvas border border-hairline rounded-md p-6">
      <h3 className="text-sm font-semibold text-ink uppercase tracking-wider mb-6">Score Over Time (%)</h3>
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[500px] h-auto overflow-visible">
          {/* Horizontal Grid lines (0%, 25%, 50%, 75%, 100%) */}
          {[0, 25, 50, 75, 100].map((percent) => {
            const y = padding + chartHeight - ((percent - minVal) / (valueRange || 1)) * chartHeight;
            if (y < padding || y > height - padding) return null;
            return (
              <g key={percent}>
                <line 
                  x1={padding} 
                  y1={y} 
                  x2={width - padding} 
                  y2={y} 
                  stroke="var(--color-hairline)" 
                  strokeDasharray="4 4" 
                />
                <text 
                  x={padding - 10} 
                  y={y + 4} 
                  textAnchor="end" 
                  className="fill-muted text-[10px] font-medium"
                >
                  {percent}%
                </text>
              </g>
            );
          })}

          {/* Average Line */}
          {avgY !== null && (
            <g>
              <line 
                x1={padding} 
                y1={avgY} 
                x2={width - padding} 
                y2={avgY} 
                stroke="var(--color-info-border)" 
                strokeWidth={1.5}
                strokeDasharray="2 2" 
              />
              <text 
                x={width - padding + 5} 
                y={avgY + 3} 
                textAnchor="start" 
                className="fill-info font-semibold text-[10px]"
              >
                Avg ({averageValue?.toFixed(0)}%)
              </text>
            </g>
          )}

          {/* Chart Line */}
          {points.length > 0 && (
            <path 
              d={pathD} 
              fill="none" 
              stroke="var(--color-ink)" 
              strokeWidth={2} 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle 
                cx={p.x} 
                cy={p.y} 
                r={4} 
                fill="var(--color-canvas)" 
                stroke="var(--color-ink)" 
                strokeWidth={2}
                className="transition-transform hover:scale-150"
              />
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                className="opacity-0 group-hover:opacity-100 fill-ink text-[10px] font-bold transition-opacity bg-canvas px-1"
              >
                {p.value}%
              </text>
              
              {/* X Axis Labels */}
              <text 
                x={p.x} 
                y={height - padding + 18} 
                textAnchor="middle" 
                className="fill-muted text-[9px] font-medium max-w-[50px] truncate"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

interface CategoryBreakdownProps {
  categories: { name: string; correct: number; total: number }[];
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  return (
    <div className="w-full bg-canvas border border-hairline rounded-md p-6">
      <h3 className="text-sm font-semibold text-ink uppercase tracking-wider mb-6">Category Breakdown</h3>
      <div className="flex flex-col gap-5">
        {categories.map((cat, index) => {
          const accuracy = cat.total > 0 ? Math.round((cat.correct / cat.total) * 100) : 0;
          
          // Color coding categories for visual hierarchy
          const colors = [
            "bg-signature-coral",
            "bg-signature-forest",
            "bg-info",
            "bg-signature-mustard",
          ];
          const colorClass = colors[index % colors.length];

          return (
            <div key={cat.name} className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-ink">{cat.name}</span>
                <span className="font-semibold text-ink">
                  {accuracy}% <span className="text-xs text-muted font-normal">({cat.correct}/{cat.total})</span>
                </span>
              </div>
              <div className="h-3 w-full bg-surface-soft rounded-full overflow-hidden border border-hairline">
                <div 
                  className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                  style={{ width: `${accuracy}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
