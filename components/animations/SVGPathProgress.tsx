"use client";

import React, { useEffect, useRef, useState } from "react";
import anime from "animejs";

export default function SVGPathProgress() {
  const pathRef = useRef<SVGPathElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    // Calculate total length of the SVG path
    const pathLength = path.getTotalLength();
    
    // Set up path dash styles for drawing animation
    path.style.strokeDasharray = `${pathLength} ${pathLength}`;
    path.style.strokeDashoffset = `${pathLength}`;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (docHeight <= 0) return;
      
      const scrollPercent = Math.min(Math.max(scrollTop / docHeight, 0), 1);
      setScrollProgress(scrollPercent);

      const drawLength = pathLength * scrollPercent;
      
      // Animate strokeDashoffset to current drawLength
      anime({
        targets: path,
        strokeDashoffset: pathLength - drawLength,
        duration: 150,
        easing: "easeOutQuad",
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run initial scroll check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-6 border border-[var(--border)] bg-[var(--card)] rounded-lg shadow-md transition-colors duration-300">
      <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-4 font-bold">
        Reading Progress
      </p>
      
      <div className="relative w-16 h-80">
        <svg
          viewBox="0 0 60 300"
          className="w-full h-full overflow-visible"
        >
          {/* Background Guide Line */}
          <path
            d="M 30,10 C 10,70 50,130 30,190 C 10,250 50,290 30,290"
            fill="none"
            stroke="var(--border)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.3"
          />
          
          {/* Active Drawing Line */}
          <path
            ref={pathRef}
            d="M 30,10 C 10,70 50,130 30,190 C 10,250 50,290 30,290"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Floating Quill Tip representing active scroll point */}
          <circle
            cx="30"
            cy="10"
            r="4"
            fill="var(--accent)"
            className="transition-all duration-150"
            style={{
              transform: `translateY(${scrollProgress * 270}px)`,
              opacity: scrollProgress > 0 ? 1 : 0,
            }}
          />
        </svg>
      </div>

      <div className="text-[11px] font-mono text-[var(--accent)] mt-3">
        {Math.round(scrollProgress * 100)}% read
      </div>
    </div>
  );
}
