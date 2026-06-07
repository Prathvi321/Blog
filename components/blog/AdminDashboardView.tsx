"use client";

import React, { useState } from "react";
import Link from "next/link";
import { updatePost, deletePost } from "@/app/actions/posts";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Trash2, Edit3, Eye, Check, X, ShieldAlert, Award, FileText, Globe, Users, BookOpen } from "lucide-react";
import anime from "animejs";

interface AdminDashboardViewProps {
  initialPosts: any[];
  stats: {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalWriters: number;
  };
}

export default function AdminDashboardView({
  initialPosts,
  stats,
}: AdminDashboardViewProps) {
  const [posts, setPosts] = useState<any[]>(initialPosts);

  // Toggle status between draft and published
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "published" ? "draft" : "published";
    const updates: any = { status: nextStatus };
    
    if (nextStatus === "published") {
      updates.published_at = new Date().toISOString();
    }

    const res = await updatePost(id, updates);
    if (res.success) {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: nextStatus, published_at: updates.published_at } : p))
      );
    } else {
      alert(`Status update failed: ${res.error}`);
    }
  };

  // Delete handler with row fade transition
  const handleDelete = async (id: string, elementId: string) => {
    if (!confirm("Are you sure you want to delete this article? This action is administrative and permanent.")) return;

    anime({
      targets: `#${elementId}`,
      opacity: 0,
      translateX: -30,
      duration: 350,
      easing: "easeInQuad",
      complete: async () => {
        const res = await deletePost(id);
        if (res.success) {
          setPosts((prev) => prev.filter((p) => p.id !== id));
        } else {
          alert(`Delete failed: ${res.error}`);
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
      
      {/* Title Header */}
      <div className="border-b border-[var(--border)] pb-8 mb-12 flex items-center gap-3 transition-colors duration-300">
        <div className="p-3 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 rounded">
          <Award size={26} />
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--accent)] font-semibold">
            System Overlord Control
          </span>
          <h1 className="font-serif-editorial text-4xl font-normal text-[var(--foreground)] mt-1">
            Global Administration
          </h1>
        </div>
      </div>

      {/* Stats Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-12">
        <Card className="flex items-center gap-4 py-6">
          <div className="p-3 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 rounded">
            <BookOpen size={18} />
          </div>
          <div>
            <p className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider">Total entries</p>
            <h3 className="font-serif-editorial text-2xl font-bold mt-0.5 text-[var(--foreground)]">{posts.length}</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-6">
          <div className="p-3 bg-green-500/10 text-green-500 border border-green-500/20 rounded">
            <Globe size={18} />
          </div>
          <div>
            <p className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider">Published</p>
            <h3 className="font-serif-editorial text-2xl font-bold mt-0.5 text-[var(--foreground)]">
              {posts.filter(p => p.status === "published").length}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-6">
          <div className="p-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded">
            <FileText size={18} />
          </div>
          <div>
            <p className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider">Drafts</p>
            <h3 className="font-serif-editorial text-2xl font-bold mt-0.5 text-[var(--foreground)]">
              {posts.filter(p => p.status === "draft").length}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-6">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded">
            <Users size={18} />
          </div>
          <div>
            <p className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider">Total Writers</p>
            <h3 className="font-serif-editorial text-2xl font-bold mt-0.5 text-[var(--foreground)]">{stats.totalWriters}</h3>
          </div>
        </Card>
      </div>

      {/* Global Posts Catalog */}
      <div>
        <h2 className="font-serif-editorial text-2xl mb-6 text-[var(--foreground)] border-b border-[var(--border)] pb-2 transition-colors duration-300">
          Global Post Catalog
        </h2>

        {posts.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-[var(--border)] bg-[var(--card)]/10 rounded transition-colors duration-300">
            <p className="text-xs font-mono text-[var(--muted-foreground)]">No articles created in the database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[var(--border)] bg-[var(--card)] rounded-lg transition-colors duration-300">
            <table className="min-w-full divide-y divide-[var(--border)] text-left text-sm font-light">
              <thead className="border-b border-[var(--border)] bg-[var(--background)]/50 text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] transition-colors duration-300">
                <tr>
                  <th scope="col" className="px-6 py-4">Title</th>
                  <th scope="col" className="px-6 py-4">Author</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4">Last Updated</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-[var(--border)]">
                {posts.map((post) => {
                  const elId = `admin-post-${post.id}`;
                  const isPub = post.status === "published";

                  return (
                    <tr
                      key={post.id}
                      id={elId}
                      className="hover:bg-[var(--background)]/30 transition-colors duration-250"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-serif-editorial text-base text-[var(--foreground)]">
                        {post.title || <span className="italic text-[var(--muted-foreground)]">Untitled</span>}
                      </td>
                      
                      <td className="whitespace-nowrap px-6 py-4 text-xs font-mono text-[var(--muted-foreground)]">
                        {post.profiles?.display_name || "Unknown"}
                      </td>
                      
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge variant={isPub ? "accent" : "outline"}>
                          {post.status}
                        </Badge>
                      </td>
                      
                      <td className="whitespace-nowrap px-6 py-4 text-xs font-mono text-[var(--muted-foreground)]">
                        {new Date(post.updated_at).toLocaleDateString()}
                      </td>
                      
                      <td className="whitespace-nowrap px-6 py-4 text-right flex items-center justify-end gap-3.5">
                        {isPub ? (
                          <button
                            onClick={() => handleToggleStatus(post.id, post.status)}
                            className="p-1.5 border border-[var(--border)] hover:border-amber-500/30 hover:text-amber-500 bg-[var(--card)] rounded transition-all"
                            title="Unpublish (revert to draft)"
                          >
                            <X size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(post.id, post.status)}
                            className="p-1.5 border border-[var(--border)] hover:border-green-500/30 hover:text-green-500 bg-[var(--card)] rounded transition-all"
                            title="Approve & Publish Live"
                          >
                            <Check size={14} />
                          </button>
                        )}

                        <Link href={`/write/${post.id}`}>
                          <button
                            className="p-1.5 border border-[var(--border)] hover:border-[var(--accent)]/30 hover:text-[var(--accent)] bg-[var(--card)] rounded transition-all"
                            title="Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                        </Link>

                        {isPub && (
                          <Link href={`/blog/${post.slug}`}>
                            <button
                              className="p-1.5 border border-[var(--border)] hover:border-[var(--foreground)]/30 hover:text-[var(--foreground)] bg-[var(--card)] rounded transition-all"
                              title="View Live"
                            >
                              <Eye size={14} />
                            </button>
                          </Link>
                        )}

                        <button
                          onClick={() => handleDelete(post.id, elId)}
                          className="p-1.5 border border-[var(--border)] hover:border-red-500/30 hover:text-red-500 bg-[var(--card)] rounded transition-all"
                          title="Delete permanently"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
