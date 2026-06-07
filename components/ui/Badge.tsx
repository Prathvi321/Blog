import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "outline" | "accent";
}

export default function Badge({
  children,
  className,
  variant = "primary",
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider transition-all duration-300";

  const variants = {
    primary: "bg-[var(--muted)] text-[var(--foreground)]",
    secondary: "bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)]",
    outline: "border border-[var(--border)] text-[var(--foreground)]",
    accent: "bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30",
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
