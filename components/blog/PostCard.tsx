"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { Clock, ArrowUpRight, Calendar, User } from "lucide-react";
import React, { useRef } from "react";
import anime from "animejs";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    cover_image_url?: string;
    excerpt?: string;
    tags?: string[];
    reading_time_minutes?: number;
    published_at?: string;
    profiles?: {
      display_name: string;
      avatar_url: string;
    } | null;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    
    // Scale and generate amber border-glow on hover
    anime({
      targets: cardRef.current,
      scale: 1.018,
      borderColor: "#E8A045",
      boxShadow: "0 12px 35px rgba(232, 160, 69, 0.08)",
      duration: 300,
      easing: "easeOutQuad",
    });
  };

  const handleMouseLeave = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    
    // Reset back to original layout border
    anime({
      targets: cardRef.current,
      scale: 1.0,
      borderColor: "var(--border)",
      boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)",
      duration: 300,
      easing: "easeOutQuad",
    });
  };

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Draft";

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="grid-item flex flex-col justify-between overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 transition-colors duration-300 h-full relative"
    >
      <div>
        {/* Cover Image aspect ratio */}
        {post.cover_image_url && (
          <div className="relative mb-5 aspect-[16/10] w-full overflow-hidden rounded-md border border-[var(--border)] bg-[var(--background)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Heading */}
        <Link href={`/blog/${post.slug}`} className="group/title block">
          <h3 className="font-serif-editorial text-xl font-medium leading-snug tracking-tight text-[var(--foreground)] group-hover/title:text-[var(--accent)] transition-colors duration-300 flex items-start justify-between">
            <span className="line-clamp-2">{post.title}</span>
            <ArrowUpRight
              size={18}
              className="ml-2 mt-1 shrink-0 opacity-0 group-hover/title:opacity-100 group-hover/title:translate-x-0.5 group-hover/title:-translate-y-0.5 transition-all duration-300 text-[var(--accent)]"
            />
          </h3>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mt-3 text-sm text-[var(--muted-foreground)] line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted-foreground)] font-mono">
        <div className="flex items-center gap-1.5">
          {post.profiles?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.profiles.avatar_url}
              alt={post.profiles.display_name}
              className="h-4 w-4 rounded-full border border-[var(--border)]"
            />
          ) : (
            <User size={12} />
          )}
          <span>{post.profiles?.display_name || "Unknown Author"}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {post.reading_time_minutes || 1} min
          </span>
        </div>
      </div>
    </div>
  );
}
