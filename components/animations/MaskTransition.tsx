"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import anime from "animejs";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("dark");
  const [isAnimating, setIsAnimating] = useState(false);
  const [maskPos, setMaskPos] = useState({ x: 0, y: 0 });
  const [circleRadius, setCircleRadius] = useState(0);
  const [wipeColor, setWipeColor] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);

  // Sync with document element on mount
  useEffect(() => {
    const isLight = document.documentElement.classList.contains("light-theme");
    setTheme(isLight ? "light" : "dark");
  }, []);

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isAnimating) return;

    // Get click position or fallback to center of window
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (e && e.clientX !== undefined && e.clientY !== undefined) {
      x = e.clientX;
      y = e.clientY;
    }

    const nextTheme = theme === "dark" ? "light" : "dark";
    // Target background colors mapping
    const nextWipeColor = nextTheme === "light" ? "#f5f0e8" : "#0d0d0d";

    setMaskPos({ x, y });
    setWipeColor(nextWipeColor);
    setIsAnimating(true);
    setCircleRadius(0);

    // Calculate maximum radius to cover the entire viewport from click point
    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxDistX = Math.max(x, w - x);
    const maxDistY = Math.max(y, h - y);
    const maxRadius = Math.sqrt(maxDistX * maxDistX + maxDistY * maxDistY) + 100;

    const animObj = { r: 0 };

    anime({
      targets: animObj,
      r: maxRadius,
      duration: 900,
      easing: "easeInOutQuart",
      update: () => {
        setCircleRadius(animObj.r);
      },
      complete: () => {
        // Set the active class on document element
        if (nextTheme === "light") {
          document.documentElement.classList.add("light-theme");
        } else {
          document.documentElement.classList.remove("light-theme");
        }
        setTheme(nextTheme);

        // Gracefully fade out the overlay circle
        anime({
          targets: svgRef.current,
          opacity: 0,
          duration: 350,
          easing: "easeOutQuad",
          complete: () => {
            setIsAnimating(false);
            setCircleRadius(0);
            if (svgRef.current) {
              svgRef.current.style.opacity = "1";
            }
          },
        });
      },
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
      {isAnimating && (
        <svg
          ref={svgRef}
          className="fixed inset-0 w-full h-full pointer-events-none z-[99999]"
          style={{ opacity: 1 }}
        >
          <circle
            ref={circleRef}
            cx={maskPos.x}
            cy={maskPos.y}
            r={circleRadius}
            fill={wipeColor}
          />
        </svg>
      )}
    </ThemeContext.Provider>
  );
};
