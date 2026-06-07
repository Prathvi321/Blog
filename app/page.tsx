import { getPosts } from "@/app/actions/posts";
import JournalHome from "@/components/blog/JournalHome";

// Force dynamic rendering to ensure posts fetch the latest updates
export const revalidate = 0;

export default async function Homepage() {
  // Fetch all published posts
  const posts = await getPosts({ status: "published" });

  // Dynamically extract all unique tags from the published posts
  const allTags = Array.from(
    new Set(posts.flatMap((post) => post.tags || []))
  ).filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      <JournalHome initialPosts={posts} tags={allTags} />
    </div>
  );
}
