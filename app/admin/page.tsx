import { redirect } from "next/navigation";
import { getCurrentProfile, getAdminStats } from "@/app/actions/posts";
import { supabaseAdmin } from "@/lib/supabase";
import AdminDashboardView from "@/components/blog/AdminDashboardView";

export const revalidate = 0;

export default async function AdminPage() {
  const profile = await getCurrentProfile();
  
  // Guard route for Admin-only access
  if (!profile) {
    redirect("/sign-in");
  }

  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch all posts in the system across all authors
  const { data: allPosts, error } = await supabaseAdmin
    .from("posts")
    .select("*, profiles(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load admin posts list:", error);
  }

  // Fetch site-wide analytics metrics
  const stats = await getAdminStats();

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 sm:py-16 transition-colors duration-300">
      <AdminDashboardView initialPosts={allPosts || []} stats={stats} />
    </div>
  );
}
