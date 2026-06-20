import Link from "next/link";
import React from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-hairline rounded-lg bg-surface-soft">
      {icon ? (
        <div className="text-muted mb-4">{icon}</div>
      ) : (
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-strong text-muted text-xl font-bold mb-4">
          ?
        </div>
      )}
      <h3 className="text-lg font-medium text-ink mb-1">{title}</h3>
      <p className="text-sm text-body max-w-sm mb-6">{description}</p>
      
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary btn-sm">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
