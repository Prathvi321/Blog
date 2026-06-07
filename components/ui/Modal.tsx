"use client";

import React, { useEffect, useRef } from "react";
import anime from "animejs";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: "center" | "right"; // "right" is used for the revision slide-in panel!
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  position = "center",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";

      // Fade in background overlay
      anime({
        targets: overlayRef.current,
        opacity: [0, 1],
        duration: 300,
        easing: "easeOutQuad",
      });

      // Transition panel
      if (position === "right") {
        anime({
          targets: panelRef.current,
          translateX: ["100%", "0%"],
          duration: 400,
          easing: "easeOutCubic",
        });
      } else {
        anime({
          targets: panelRef.current,
          scale: [0.93, 1],
          opacity: [0, 1],
          duration: 300,
          easing: "easeOutBack",
        });
      }
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, position]);

  const handleClose = () => {
    // Fade out overlay
    anime({
      targets: overlayRef.current,
      opacity: 0,
      duration: 200,
      easing: "easeInQuad",
    });

    if (position === "right") {
      anime({
        targets: panelRef.current,
        translateX: "100%",
        duration: 300,
        easing: "easeInCubic",
        complete: onClose,
      });
    } else {
      anime({
        targets: panelRef.current,
        scale: 0.93,
        opacity: 0,
        duration: 200,
        easing: "easeInQuad",
        complete: onClose,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop overlay */}
      <div
        ref={overlayRef}
        onClick={handleClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        style={{ opacity: 0 }}
      />

      {/* Main modal container */}
      <div
        ref={panelRef}
        className={`fixed bg-[var(--card)] border-[var(--border)] shadow-2xl flex flex-col z-10 transition-colors duration-300 ${
          position === "right"
            ? "right-0 top-0 h-screen w-full max-w-xl border-l"
            : "max-w-lg w-full rounded-lg border p-6 m-4"
        }`}
        style={position === "right" ? { transform: "translateX(100%)" } : { opacity: 0 }}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
          <h3 className="font-serif-editorial text-xl font-medium text-[var(--foreground)]">
            {title}
          </h3>
          <button
            onClick={handleClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1.5 rounded-full hover:bg-[var(--border)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal body contents */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
