import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "default" | "sm";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

type LinkButtonProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "text-body px-4 py-2 rounded-lg active:bg-surface-soft",
};

const sizeClass: Record<Size, string> = {
  default: "",
  sm: "btn-sm",
};

export function Button({
  variant = "primary",
  size = "default",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(variantClass[variant], sizeClass[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "default",
  className,
  children,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(variantClass[variant], sizeClass[size], className)}
    >
      {children}
    </Link>
  );
}
