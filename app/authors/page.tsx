import React from "react";
import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import Badge from "@/components/ui/Badge";
import { BookOpen, Calendar, MapPin, User } from "lucide-react";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Authors Directory",
  description: "The minds and curators behind the Byte & Build publications.",
};

export default async function AuthorsPage() {
  // Fetch profiles along with their posts to compute count statistics
  const { data: profiles, error } = await supabaseAdmin
    .from("profiles")
    .select("*, posts(id, status)")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load profiles:", error);
  }

  const authors = profiles || [];

  return (
    <div className="min-h-screen bg-[var(--background)] py-16 sm:py-24 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        
        {/* Title */}
        <div className="mb-16 max-w-2xl">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--accent)] font-semibold mb-3 block">
            Behind the Ink
          </span>
          <h1 className="font-serif-editorial text-4xl sm:text-5xl font-bold tracking-tight text-[var(--foreground)]">
            JOURNAL EDITORS
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed font-light">
            Meet the select collaborative of writers and software engineers sharing insights 
            on high-performance frontend code, deep design interactions, and architecture.
          </p>
        </div>

        {/* Authors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {authors.map((author) => {
            const postsList = author.posts || [];
            const publishedCount = postsList.filter((p: any) => p.status === "published").length;
            const draftCount = postsList.filter((p: any) => p.status === "draft").length;
            
            const joinDate = new Date(author.created_at).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={author.id}
                className="border border-[var(--border)] bg-[var(--card)] rounded-lg p-8 flex flex-col justify-between hover:border-[var(--accent)] hover:shadow-lg hover:shadow-[var(--accent)]/5 transition-all duration-300 relative group"
              >
                {/* Accent design detail */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--border)] group-hover:bg-[var(--accent)] transition-colors duration-500" />
                
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    {author.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={author.avatar_url}
                        alt={author.display_name}
                        className="h-16 w-16 rounded-full border border-[var(--border)] object-cover shadow"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)]">
                        <User size={28} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-serif-editorial text-xl font-medium text-[var(--foreground)]">
                        {author.display_name}
                      </h3>
                      <p className="text-[10px] font-mono text-[var(--accent)] uppercase tracking-wider mt-0.5">
                        {author.role}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-6 font-light">
                    {author.bio || "No biography provided by this journal contributor."}
                  </p>
                </div>

                <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between text-[11px] font-mono text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-[var(--accent)]" />
                    Joined {joinDate}
                  </span>
                  
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={13} className="text-[var(--accent)]" />
                    {publishedCount} {publishedCount === 1 ? "Article" : "Articles"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
