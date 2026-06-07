"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/animations/MaskTransition";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Sun, Moon, Feather, Compass, Users, Layers, Award } from "lucide-react";
import React, { useEffect, useRef } from "react";
import anime from "animejs";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const navRef = useRef<HTMLElement>(null);
  const { isSignedIn, isLoaded } = useAuth();

  // Animate navigation bar entries on initial mount
  useEffect(() => {
    anime({
      targets: ".nav-item",
      opacity: [0, 1],
      translateY: [-10, 0],
      delay: anime.stagger(100, { start: 200 }),
      easing: "easeOutExpo",
      duration: 800,
    });
  }, []);

  const navLinks = [
    { href: "/", label: "Journal", icon: Compass },
    { href: "/authors", label: "Authors", icon: Users },
    { href: "/dashboard", label: "Dashboard", icon: Layers },
    { href: "/write", label: "Write", icon: Feather },
    { href: "/admin", label: "Admin", icon: Award },
  ];

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md transition-colors duration-300"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8">
        {/* Brand Logo */}
        <div className="nav-item flex items-center gap-2" style={{ opacity: 0 }}>
          <Link
            href="/"
            className="font-serif-editorial text-2xl font-bold tracking-tight text-[var(--accent)] hover:opacity-90 transition-opacity"
          >
            A N T I G R A V I T Y
          </Link>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-item relative flex items-center gap-1.5 text-sm font-medium tracking-wide uppercase transition-colors duration-200 py-2 ${
                  isActive ? "text-[var(--accent)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
                style={{ opacity: 0 }}
              >
                <Icon size={14} />
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-[1.5px] w-full bg-[var(--accent)] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="nav-item flex items-center gap-4" style={{ opacity: 0 }}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--border)] hover:text-[var(--accent)] transition-all duration-300 shadow-sm"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Clerk Auth Buttons */}
          <div className="flex items-center">
            {isLoaded && isSignedIn && (
              <div className="border border-[var(--border)] rounded-full p-0.5 bg-[var(--card)]">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8 rounded-full",
                    },
                  }}
                />
              </div>
            )}
            {isLoaded && !isSignedIn && (
              <Link
                href="/sign-in"
                className="hidden sm:inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] px-5 text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] hover:bg-[var(--border)] hover:text-[var(--accent)] transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
