export function Avatar({
  name,
  size = "md",
  className = "",
}: {
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const initials = (name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sizeClass = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
  }[size];

  return (
    <div
      className={`${sizeClass} rounded-full bg-surface-strong text-ink font-medium flex items-center justify-center shrink-0 ${className}`}
      aria-hidden
    >
      {initials}
    </div>
  );
}
