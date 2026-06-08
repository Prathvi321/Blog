import React from "react";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--background)] transition-colors duration-300">
      <div className="flex flex-col items-center text-center">
        {/* Subtle, beautiful pulsing circle loader */}
        <div className="relative flex items-center justify-center w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border border-[var(--border)]" />
          <div className="absolute inset-0 rounded-full border-t border-[var(--accent)] animate-spin" style={{ animationDuration: '0.7s' }} />
          <span className="text-xs font-serif-editorial italic text-[var(--accent)]">b&b</span>
        </div>
        <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-[var(--accent)] font-semibold mb-1">
          Byte & Build
        </span>
        <span className="text-[10px] font-mono text-[var(--muted-foreground)] tracking-wider">
          Curating editorial space...
        </span>
      </div>
    </div>
  );
}
