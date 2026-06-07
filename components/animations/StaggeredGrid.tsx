"use client";

import React, { useEffect, useRef } from "react";
import anime from "animejs";

interface StaggeredGridProps {
  children: React.ReactNode;
  className?: string;
  trigger?: any; // Re-runs animation when this value changes (e.g. tag filter)
}

export default function StaggeredGrid({
  children,
  className = "",
  trigger,
}: StaggeredGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;

    const cards = gridRef.current.querySelectorAll(".grid-item");
    if (cards.length === 0) return;

    // Support accessibility preferences
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((card) => {
        const el = card as HTMLElement;
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    // Initialize animation values
    cards.forEach((card) => {
      const el = card as HTMLElement;
      el.style.opacity = "0";
      el.style.transform = "translateY(40px)";
    });

    // Animate cards blooming into view
    anime({
      targets: cards,
      opacity: [0, 1],
      translateY: [40, 0],
      duration: 800,
      delay: anime.stagger(100, { start: 100 }),
      easing: "easeOutCubic",
    });
  }, [trigger, children]);

  return (
    <div ref={gridRef} className={className}>
      {children}
    </div>
  );
}
