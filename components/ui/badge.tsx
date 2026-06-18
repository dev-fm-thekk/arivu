type BadgeVariant = "default" | "category" | "easy" | "medium" | "hard" | "admin";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface-soft text-body border-hairline",
  category: "bg-signature-cream text-ink border-transparent",
  easy: "bg-signature-mint/40 text-ink border-transparent",
  medium: "bg-signature-yellow/50 text-ink border-transparent",
  hard: "bg-signature-peach/60 text-ink border-transparent",
  admin: "bg-surface-dark text-white border-transparent",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function difficultyVariant(
  difficulty: string | null | undefined
): BadgeVariant {
  const d = difficulty?.toLowerCase();
  if (d === "easy") return "easy";
  if (d === "hard") return "hard";
  return "medium";
}
