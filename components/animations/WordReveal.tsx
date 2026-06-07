"use client";

import React, { useEffect, useRef } from "react";
import anime from "animejs";

interface WordRevealProps {
  text: string;
  className?: string;
}

export default function WordReveal({ text, className = "" }: WordRevealProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!headingRef.current) return;

    const words = headingRef.current.querySelectorAll(".word");
    if (words.length === 0) return;

    // Respect motion preferences
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      words.forEach((w) => {
        const el = w as HTMLElement;
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    // Initialize animation properties
    words.forEach((w) => {
      const el = w as HTMLElement;
      el.style.opacity = "0";
      el.style.transform = "translateY(25px)";
    });

    // Animate words sequentially
    anime({
      targets: words,
      opacity: [0, 1],
      translateY: [25, 0],
      duration: 1000,
      delay: anime.stagger(80, { start: 100 }),
      easing: "easeOutExpo",
    });
  }, [text]);

  const words = text.split(" ");

  return (
    <h1
      ref={headingRef}
      className={`font-serif-editorial flex flex-wrap leading-tight select-none ${className}`}
    >
      {words.map((word, idx) => (
        <span
          key={idx}
          className="word inline-block mr-[0.28em] py-1"
          style={{ opacity: 0 }}
        >
          {word}
        </span>
      ))}
    </h1>
  );
}
