"use client";

import React, { useState } from "react";
import KineticText from "@/components/animations/KineticText";
import StaggeredGrid from "@/components/animations/StaggeredGrid";
import TagFilter from "@/components/blog/TagFilter";
import PostCard from "@/components/blog/PostCard";
import Link from "next/link";
import { ArrowRight, Clock, Calendar, CornerDownRight } from "lucide-react";

interface JournalHomeProps {
  initialPosts: any[];
  tags: string[];
}

export default function JournalHome({ initialPosts, tags }: JournalHomeProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredPosts = selectedTag
    ? initialPosts.filter((post) => post.tags && post.tags.includes(selectedTag))
    : initialPosts;

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:py-20 transition-colors duration-300">
      {/* Hero section with kinetic typographic headers */}
      <div className="mb-16 md:mb-24 flex flex-col items-start max-w-4xl">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--accent)] font-semibold mb-3">
          Volume I — Member Protected Circulation
        </span>
        <KineticText
          text="BYTE & BUILD"
          className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--foreground)]"
        />
        <div className="flex items-start gap-3 mt-6 text-[var(--muted-foreground)] leading-relaxed max-w-2xl text-sm sm:text-base">
          <CornerDownRight size={18} className="text-[var(--accent)] shrink-0 mt-1" />
          <p>
            An artfully directed digital publication cataloging thoughts on developer agency, 
            interactive design interfaces, and high-fidelity animations. Created for a select circle of minds.
          </p>
        </div>
      </div>

      {/* Subject Filter Panel */}
      <div className="mb-12">
        <TagFilter tags={tags} selectedTag={selectedTag} onSelectTag={setSelectedTag} />
      </div>

      {filteredPosts.length === 0 ? (
        <div className="py-24 text-center border border-[var(--border)] bg-[var(--card)]/30 rounded-lg transition-colors duration-300">
          <p className="text-sm font-mono text-[var(--muted-foreground)]">
            No entries found in this catalog section.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Asymmetric Highlight layout (Featured card) */}
          {featuredPost && !selectedTag && (
            <div className="w-full border border-[var(--border)] bg-[var(--card)] rounded-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all duration-500 hover:border-[var(--accent)] hover:shadow-lg hover:shadow-[var(--accent)]/5">
              <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto relative bg-[var(--background)] border-b lg:border-b-0 lg:border-r border-[var(--border)] overflow-hidden">
                {featuredPost.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featuredPost.cover_image_url}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--muted-foreground)] bg-neutral-900/40 font-mono text-xs select-none">
                    NO COVER IMAGE
                  </div>
                )}
              </div>
              
              <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between transition-colors duration-300">
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {featuredPost.tags?.map((t: string) => (
                      <span
                        key={t}
                        className="text-[9px] font-mono text-[var(--accent)] uppercase tracking-wider bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-2.5 py-0.5 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  
                  <h2 className="font-serif-editorial text-2xl sm:text-4xl font-normal leading-tight text-[var(--foreground)] hover:text-[var(--accent)] transition-colors duration-300">
                    <Link href={`/blog/${featuredPost.slug}`}>
                      {featuredPost.title}
                    </Link>
                  </h2>
                  
                  <p className="mt-4 text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed line-clamp-4 font-light">
                    {featuredPost.excerpt}
                  </p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted-foreground)]">
                    {featuredPost.profiles?.avatar_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={featuredPost.profiles.avatar_url}
                        alt={featuredPost.profiles.display_name}
                        className="w-5 h-5 rounded-full border border-[var(--border)]"
                      />
                    )}
                    <span>{featuredPost.profiles?.display_name || "Unknown"}</span>
                  </div>
                  
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--accent)] hover:underline uppercase tracking-wider font-semibold"
                  >
                    Read Article <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Grid list for remaining blog entries */}
          <StaggeredGrid
            trigger={selectedTag}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {(selectedTag ? filteredPosts : remainingPosts).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </StaggeredGrid>
        </div>
      )}
    </div>
  );
}
