import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/app/actions/posts";
import { supabaseAdmin } from "@/lib/supabase";
import DashboardView from "@/components/blog/DashboardView";

export const revalidate = 0;

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/sign-in");
  }

  // Fetch all posts belonging to this writer
  const { data: posts, error } = await supabaseAdmin
    .from("posts")
    .select("*, profiles(*)")
    .eq("author_id", profile.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch dashboard posts:", error);
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 sm:py-16 transition-colors duration-300">
      <DashboardView initialPosts={posts || []} profile={profile} />
    </div>
  );
}
