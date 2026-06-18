import { LinkButton } from "./button";

export function EmptyState({
  icon = "📭",
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <span className="text-5xl mb-6" aria-hidden>
        {icon}
      </span>
      <h3 className="text-lg font-medium text-ink mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-body max-w-sm mb-8">{description}</p>
      )}
      {actionLabel && actionHref && (
        <LinkButton href={actionHref}>{actionLabel}</LinkButton>
      )}
    </div>
  );
}
