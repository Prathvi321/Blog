import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export default function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none rounded";

  const variants = {
    primary:
      "bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[#f5b05c] active:scale-[0.98]",
    secondary:
      "bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--border)] active:scale-[0.98]",
    outline:
      "border border-[var(--foreground)] text-[var(--foreground)] bg-transparent hover:bg-[var(--foreground)] hover:text-[var(--background)] active:scale-[0.98]",
    ghost:
      "text-[var(--foreground)] bg-transparent hover:bg-[var(--muted)] hover:text-[var(--accent)]",
  };

  const sizes = {
    sm: "h-9 px-4 text-[10px]",
    md: "h-11 px-6",
    lg: "h-13 px-8 text-sm",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-3 w-3 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
}
