import { redirect, notFound } from "next/navigation";
import { getCurrentProfile, getPostById, getPostRevisions } from "@/app/actions/posts";
import EditorPageContent from "@/components/editor/EditorPageContent";

export const revalidate = 0;

interface PageProps {
  params: {
    id: string;
  };
}

export default async function WriteEditorPage({ params }: PageProps) {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/sign-in");
  }

  const post = await getPostById(params.id);
  if (!post) {
    notFound();
  }

  // Verify that the user has permission to edit this post (author or admin)
  if (post.author_id !== profile.id && profile.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch saved revisions for this post
  const revisions = await getPostRevisions(params.id);

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 transition-colors duration-300">
      <EditorPageContent post={post} initialRevisions={revisions} profile={profile} />
    </div>
  );
}
