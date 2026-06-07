"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "@/app/actions/posts";
import { slugify } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { CornerDownRight, ArrowRight, Loader2 } from "lucide-react";

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    setSlug(slugify(val));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;

    setLoading(true);
    setError("");

    const res = await createPost(title, slug);
    if (res.success && res.data) {
      // Direct route transition to the editor page
      router.push(`/write/${res.data.id}`);
    } else {
      setError(res.error || "Failed to initialize draft article.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[var(--background)] py-16 sm:py-24 flex items-center justify-center transition-colors duration-300">
      <div className="mx-auto max-w-xl w-full px-6">
        
        <div className="mb-8">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--accent)] font-semibold block mb-2">
            Create Journal Draft
          </span>
          <h1 className="font-serif-editorial text-3xl sm:text-4xl text-[var(--foreground)] font-normal leading-tight">
            Draft a New Concept
          </h1>
        </div>

        <Card className="p-8 relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-[var(--accent)]" />

          <form onSubmit={handleCreate} className="space-y-6">
            
            {/* Title field */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="block text-[10px] font-mono uppercase tracking-wider text-[var(--foreground)] font-bold"
              >
                Article Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="The Aesthetics of Space and Form..."
                required
                className="w-full h-11 px-4 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] rounded-md focus:border-[var(--accent)] focus:outline-none text-sm font-serif-editorial transition-all"
              />
            </div>

            {/* Auto slug display */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                <CornerDownRight size={12} className="text-[var(--accent)]" />
                <span>Generated URL Slug</span>
              </div>
              <div className="w-full h-11 px-4 bg-[var(--background)]/50 border border-[var(--border)] text-[var(--muted-foreground)] rounded-md flex items-center text-xs font-mono select-none overflow-x-auto whitespace-nowrap transition-colors duration-300">
                {slug ? `/blog/${slug}` : "/blog/..."}
              </div>
            </div>

            {error && (
              <p className="text-xs font-mono text-red-500 bg-red-500/5 border border-red-500/10 p-3 rounded">
                Error: {error}
              </p>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full flex items-center justify-center gap-1.5"
            >
              Initialize Draft <ArrowRight size={14} />
            </Button>

          </form>
        </Card>

      </div>
    </div>
  );
}
