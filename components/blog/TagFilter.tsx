"use client";

import React from "react";

interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export default function TagFilter({
  tags,
  selectedTag,
  onSelectTag,
}: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2.5 items-center py-4 border-b border-[var(--border)] transition-colors duration-300">
      <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] mr-3 font-semibold">
        Filter by subject:
      </span>
      
      {/* Reset Filter Button */}
      <button
        onClick={() => onSelectTag(null)}
        className={`px-3.5 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-all duration-300 border ${
          selectedTag === null
            ? "bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]"
            : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]"
        }`}
      >
        All Posts
      </button>

      {/* Dynamic Tag Selection list */}
      {tags.map((tag) => {
        const isSelected = selectedTag === tag;
        return (
          <button
            key={tag}
            onClick={() => onSelectTag(tag)}
            className={`px-3.5 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-all duration-300 border ${
              isSelected
                ? "bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]"
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
