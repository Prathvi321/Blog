"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { calculateReadingTime } from "@/lib/utils";

// Fetch user profile from Supabase using Clerk session
export async function getCurrentProfile() {
  try {
    const session = await auth();
    const clerkId = session?.userId;
    if (!clerkId) return null;

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("clerk_id", clerkId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
}

// Fetch all posts (optionally filtered by status/tag)
export async function getPosts(options?: { status?: string; tag?: string }) {
  try {
    let query = supabaseAdmin
      .from("posts")
      .select("*, profiles(*)")
      .order("created_at", { ascending: false });

    if (options?.status) {
      query = query.eq("status", options.status);
    }
    
    const { data: posts, error } = await query;
    if (error) throw error;

    // Filter by tag in memory since tag array filtering can be tricky in Supabase
    if (options?.tag && posts) {
      return posts.filter((post) => post.tags && post.tags.includes(options.tag));
    }

    return posts || [];
  } catch (error) {
    console.error("getPosts failed:", error);
    return [];
  }
}

// Fetch single post by slug
export async function getPostBySlug(slug: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("posts")
      .select("*, profiles(*)")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`getPostBySlug for slug ${slug} failed:`, error);
    return null;
  }
}

// Fetch single post by id (for editing)
export async function getPostById(id: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("posts")
      .select("*, profiles(*)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`getPostById for id ${id} failed:`, error);
    return null;
  }
}

// Create new post draft
export async function createPost(title: string, slug: string) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) throw new Error("Unauthorized");

    const defaultContent = {
      time: Date.now(),
      blocks: [
        {
          id: "intro-paragraph",
          type: "paragraph",
          data: {
            text: "Start sharing your thoughts here...",
          },
        },
      ],
      version: "2.29.0",
    };

    const { data, error } = await supabaseAdmin
      .from("posts")
      .insert({
        title,
        slug,
        author_id: profile.id,
        content: defaultContent,
        tags: [],
        status: "draft",
        reading_time_minutes: 1,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("createPost failed:", error);
    return { success: false, error: error.message };
  }
}

// Update existing post
export async function updatePost(id: string, updates: any) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) throw new Error("Unauthorized");

    // Re-calculate reading time if content is updated
    if (updates.content) {
      updates.reading_time_minutes = calculateReadingTime(updates.content);
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("posts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("updatePost failed:", error);
    return { success: false, error: error.message };
  }
}

// Save post revision history
export async function savePostRevision(postId: string, content: any) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) throw new Error("Unauthorized");

    const { data, error } = await supabaseAdmin
      .from("post_revisions")
      .insert({
        post_id: postId,
        content,
        saved_by: profile.id,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("savePostRevision failed:", error);
    return { success: false, error: error.message };
  }
}

// Fetch all revisions for a post
export async function getPostRevisions(postId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("post_revisions")
      .select("*, profiles(*)")
      .eq("post_id", postId)
      .order("saved_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("getPostRevisions failed:", error);
    return [];
  }
}

// Upload cover image to Supabase Storage bucket
export async function uploadCoverImage(base64Data: string, fileName: string) {
  try {
    // Check authentication
    const profile = await getCurrentProfile();
    if (!profile) throw new Error("Unauthorized");

    // Clean base64 string
    const base64Content = base64Data.split(";base64,").pop();
    if (!base64Content) throw new Error("Invalid base64 encoding");
    const buffer = Buffer.from(base64Content, "base64");

    const filePath = `covers/${profile.id}/${Date.now()}_${fileName}`;

    // Upload using admin client
    const { error } = await supabaseAdmin.storage
      .from("blog-assets")
      .upload(filePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      // If bucket doesn't exist, try creating it, then uploading
      if (error.message.includes("Bucket not found")) {
        await supabaseAdmin.storage.createBucket("blog-assets", {
          public: true,
        });
        const { error: retryError } = await supabaseAdmin.storage
          .from("blog-assets")
          .upload(filePath, buffer, {
            contentType: "image/jpeg",
            upsert: true,
          });
        if (retryError) throw retryError;
      } else {
        throw error;
      }
    }

    // Get public URL
    const { data } = supabaseAdmin.storage.from("blog-assets").getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error: any) {
    console.error("uploadCoverImage failed:", error);
    throw new Error(error.message || "Failed to upload image");
  }
}

// Admin stats action
export async function getAdminStats() {
  try {
    const profile = await getCurrentProfile();
    if (!profile || profile.role !== "admin") throw new Error("Unauthorized");

    const { data: allPosts, error: postsError } = await supabaseAdmin
      .from("posts")
      .select("status, author_id");

    const { count: totalWriters } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (postsError) throw postsError;

    const publishedCount = allPosts?.filter(p => p.status === "published").length || 0;
    const draftCount = allPosts?.filter(p => p.status === "draft").length || 0;
    
    return {
      totalPosts: allPosts?.length || 0,
      publishedPosts: publishedCount,
      draftPosts: draftCount,
      totalWriters: totalWriters || 0
    };
  } catch (error) {
    console.error("getAdminStats failed:", error);
    return {
      totalPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      totalWriters: 0
    };
  }
}

export async function deletePost(id: string) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) throw new Error("Unauthorized");

    // Check ownership or admin status
    const { data: post, error: fetchError } = await supabaseAdmin
      .from("posts")
      .select("author_id")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    if (post.author_id !== profile.id && profile.role !== "admin") {
      throw new Error("Forbidden");
    }

    const { error: deleteError } = await supabaseAdmin
      .from("posts")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;
    return { success: true };
  } catch (error: any) {
    console.error("deletePost failed:", error);
    return { success: false, error: error.message };
  }
}
