import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export default function Card({
  children,
  className,
  hoverEffect = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 transition-all duration-300",
        hoverEffect && "hover:border-[var(--accent)] hover:shadow-lg hover:shadow-[var(--accent)]/5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
