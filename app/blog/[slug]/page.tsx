import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPosts } from "@/app/actions/posts";
import WordReveal from "@/components/animations/WordReveal";

import PostRenderer from "@/components/blog/PostRenderer";
import Comments from "@/components/blog/Comments";
import Badge from "@/components/ui/Badge";
import PostCard from "@/components/blog/PostCard";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";

export const revalidate = 0;

interface PageProps {
  params: {
    slug: string;
  };
}

// Dynamic OpenGraph Metadata Generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt || "An exclusive article published on Antigravity Journal.",
    openGraph: {
      title: post.title,
      description: post.excerpt || "An exclusive article published on Antigravity Journal.",
      type: "article",
      publishedTime: post.published_at || undefined,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : [],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    notFound();
  }

  // Fetch related articles (excluding the active one)
  const allPosts = await getPosts({ status: "published" });
  const relatedPosts = allPosts
    .filter((p) => p.id !== post.id)
    .slice(0, 3);

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Draft";

  return (
    <article className="min-h-screen bg-[var(--background)] py-12 sm:py-20 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        
        {/* Back Link */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors duration-300"
          >
            <ArrowLeft size={14} /> Back to Journal
          </Link>
        </div>

        {/* Article Header Grid */}
        <div className="border-b border-[var(--border)] pb-8 mb-12 transition-colors duration-300">
          <div className="flex flex-wrap gap-2.5 mb-5">
            {post.tags?.map((tag: string) => (
              <Badge key={tag} variant="accent">
                {tag}
              </Badge>
            ))}
          </div>

          <WordReveal
            text={post.title}
            className="text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight mb-6"
          />

          <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-[var(--muted-foreground)] pt-2">
            <div className="flex items-center gap-2">
              {post.profiles?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.profiles.avatar_url}
                  alt={post.profiles.display_name}
                  className="h-5 w-5 rounded-full border border-[var(--border)]"
                />
              ) : (
                <User size={14} />
              )}
              <span className="text-[var(--foreground)]">{post.profiles?.display_name || "Unknown"}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>{post.reading_time_minutes || 1} min read</span>
            </div>
          </div>
        </div>

        {/* Main Body + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Article Content */}
          <div className="lg:col-span-8 space-y-8">
            {post.cover_image_url && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] transition-colors duration-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Document parser */}
            <div className="mt-8">
              <PostRenderer content={post.content} />
            </div>

            {/* Giscus Comments panel */}
            <Comments />
          </div>

          {/* Sticky Sidebar */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28 h-fit space-y-8">


            {/* Author Bio Card */}
            <div className="border border-[var(--border)] bg-[var(--card)] p-6 rounded-lg transition-colors duration-300">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] mb-4 font-bold">
                About The Author
              </h4>
              <div className="flex items-center gap-3 mb-4">
                {post.profiles?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.profiles.avatar_url}
                    alt={post.profiles.display_name}
                    className="h-12 w-12 rounded-full border border-[var(--border)]"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)]">
                    <User size={20} />
                  </div>
                )}
                <div>
                  <h5 className="font-serif-editorial text-base text-[var(--foreground)]">
                    {post.profiles?.display_name || "Unknown Author"}
                  </h5>
                  <p className="text-[10px] font-mono uppercase text-[var(--accent)] tracking-wider">
                    {post.profiles?.role || "Writer"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed font-light">
                {post.profiles?.bio || "A selected editorial writer sharing knowledge on tech and structure."}
              </p>
            </div>
          </aside>
        </div>

        {/* Related Posts section */}
        {relatedPosts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-[var(--border)] transition-colors duration-300">
            <h3 className="font-serif-editorial text-2xl mb-8 text-[var(--foreground)] font-normal">
              Further Reading
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rPost) => (
                <div key={rPost.id} className="grid-item">
                  <PostCard post={rPost} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </article>
  );
}
