"use client";

import React from "react";
import Giscus from "@giscus/react";
import { useTheme } from "@/components/animations/MaskTransition";

export default function Comments() {
  const { theme } = useTheme();

  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO || "";
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID || "";
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY || "";
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || "";

  // If Giscus configs are not loaded, show a styled placeholder
  if (!repo || !repoId) {
    return (
      <div className="mt-16 pt-8 border-t border-[var(--border)] text-center py-6 text-xs text-[var(--muted-foreground)] font-mono transition-colors duration-300">
        GISCUS COMMENTS PENDING CONFIGURATION (.env)
      </div>
    );
  }

  return (
    <div className="mt-16 pt-8 border-t border-[var(--border)] transition-colors duration-300">
      <Giscus
        id="comments"
        repo={repo as any}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping="pathname"
        term="Welcome to Byte & Build Discussions!"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme === "dark" ? "dark_dimmed" : "light"}
        lang="en"
        loading="lazy"
      />
    </div>
  );
}
