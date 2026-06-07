"use client";

import React, { useEffect, useRef } from "react";
import anime from "animejs";

interface KineticTextProps {
  text: string;
  className?: string;
}

export default function KineticText({ text, className = "" }: KineticTextProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check for user's motion preferences
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const letters = containerRef.current.querySelectorAll(".letter");
      letters.forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
      });
      return;
    }

    // Staggered letters sliding down and fading in
    anime({
      targets: containerRef.current.querySelectorAll(".letter"),
      translateY: [-60, 0],
      opacity: [0, 1],
      easing: "easeOutExpo",
      duration: 1200,
      delay: anime.stagger(35),
    });
  }, [text]);

  const words = text.split(" ");

  return (
    <h1
      ref={containerRef}
      className={`font-serif-editorial select-none flex flex-wrap leading-tight ${className}`}
    >
      {words.map((word, wIdx) => (
        <span key={wIdx} className="inline-block whitespace-nowrap mr-[0.3em]">
          {word.split("").map((letter, lIdx) => (
            <span
              key={lIdx}
              className="letter inline-block"
              style={{ opacity: 0 }}
            >
              {letter}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}
