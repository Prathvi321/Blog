"use client";

import React, { useState } from "react";
import Link from "next/link";
import { deletePost } from "@/app/actions/posts";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Plus, Edit3, Trash2, Eye, FileText, Globe, BookOpen, User } from "lucide-react";
import anime from "animejs";

interface DashboardViewProps {
  initialPosts: any[];
  profile: any;
}

export default function DashboardView({ initialPosts, profile }: DashboardViewProps) {
  const [posts, setPosts] = useState<any[]>(initialPosts);

  const drafts = posts.filter((p) => p.status === "draft");
  const published = posts.filter((p) => p.status === "published");

  const handleDelete = async (id: string, elementId: string) => {
    if (!confirm("Are you certain you want to delete this article? This action cannot be undone.")) return;

    // Animate row sliding left and fading out
    anime({
      targets: `#${elementId}`,
      opacity: 0,
      translateX: -40,
      duration: 400,
      easing: "easeInCubic",
      complete: async () => {
        const res = await deletePost(id);
        if (res.success) {
          setPosts((prev) => prev.filter((p) => p.id !== id));
        } else {
          alert(`Delete failed: ${res.error}`);
          // Reset style properties on failure
          const el = document.getElementById(elementId);
          if (el) {
            el.style.opacity = "1";
            el.style.transform = "none";
          }
        }
      },
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 sm:px-8 transition-colors duration-300">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] pb-8 mb-12 gap-6 transition-colors duration-300">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--accent)] font-semibold">
            Writer Dashboard
          </span>
          <h1 className="font-serif-editorial text-4xl font-normal text-[var(--foreground)] mt-2">
            Welcome back, {profile.display_name}
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mt-1 font-mono">
            Access Role: {profile.role}
          </p>
        </div>

        <div>
          <Link href="/write">
            <Button className="flex items-center gap-2">
              <Plus size={14} /> New Article
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <Card className="flex items-center gap-4 py-8">
          <div className="p-3 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 rounded">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider">Total Articles</p>
            <h3 className="font-serif-editorial text-2xl font-bold mt-1 text-[var(--foreground)]">{posts.length}</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-8">
          <div className="p-3 bg-green-500/10 text-green-500 border border-green-500/20 rounded">
            <Globe size={20} />
          </div>
          <div>
            <p className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider">Published</p>
            <h3 className="font-serif-editorial text-2xl font-bold mt-1 text-[var(--foreground)]">{published.length}</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-8">
          <div className="p-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider">Drafts</p>
            <h3 className="font-serif-editorial text-2xl font-bold mt-1 text-[var(--foreground)]">{drafts.length}</h3>
          </div>
        </Card>
      </div>

      {/* Drafts Section */}
      <div className="mb-12">
        <h2 className="font-serif-editorial text-2xl mb-6 text-[var(--foreground)] border-b border-[var(--border)] pb-2 transition-colors duration-300">
          My Drafts
        </h2>

        {drafts.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-[var(--border)] bg-[var(--card)]/10 rounded transition-colors duration-300">
            <p className="text-xs font-mono text-[var(--muted-foreground)]">No drafts saved.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft) => {
              const elId = `draft-${draft.id}`;
              return (
                <div
                  key={draft.id}
                  id={elId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between border border-[var(--border)] bg-[var(--card)] p-5 rounded-lg gap-4 hover:border-[var(--accent)]/50 transition-colors duration-300"
                >
                  <div className="space-y-1">
                    <h4 className="font-serif-editorial text-lg text-[var(--foreground)] font-normal">
                      {draft.title || "Untitled Article"}
                    </h4>
                    <p className="text-xs font-mono text-[var(--muted-foreground)]">
                      Last edited: {new Date(draft.updated_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Link href={`/write/${draft.id}`}>
                      <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                        <Edit3 size={12} /> Edit
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleDelete(draft.id, elId)}
                      className="h-9 w-9 flex items-center justify-center border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-red-500 hover:border-red-500/30 rounded transition-all duration-300"
                      aria-label="Delete draft"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Published Section */}
      <div>
        <h2 className="font-serif-editorial text-2xl mb-6 text-[var(--foreground)] border-b border-[var(--border)] pb-2 transition-colors duration-300">
          Published Articles
        </h2>

        {published.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-[var(--border)] bg-[var(--card)]/10 rounded transition-colors duration-300">
            <p className="text-xs font-mono text-[var(--muted-foreground)]">No published posts.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {published.map((pub) => {
              const elId = `pub-${pub.id}`;
              return (
                <div
                  key={pub.id}
                  id={elId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between border border-[var(--border)] bg-[var(--card)] p-5 rounded-lg gap-4 hover:border-[var(--accent)]/50 transition-colors duration-300"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif-editorial text-lg text-[var(--foreground)] font-normal">
                        {pub.title}
                      </h4>
                      <Badge variant="accent">Live</Badge>
                    </div>
                    <p className="text-xs font-mono text-[var(--muted-foreground)]">
                      Published: {new Date(pub.published_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Link href={`/blog/${pub.slug}`}>
                      <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                        <Eye size={12} /> View
                      </Button>
                    </Link>
                    <Link href={`/write/${pub.id}`}>
                      <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                        <Edit3 size={12} /> Edit
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleDelete(pub.id, elId)}
                      className="h-9 w-9 flex items-center justify-center border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-red-500 hover:border-red-500/30 rounded transition-all duration-300"
                      aria-label="Delete article"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
