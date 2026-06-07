"use server";

import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function syncUserProfile() {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const clerkId = user.id;
    const username = user.username || `user_${clerkId.slice(-6)}`;
    const email = user.emailAddresses[0]?.emailAddress || "";
    const display_name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || username;
    const avatar_url = user.imageUrl || "";

    // 1. Check if user already exists
    const { data: existingProfile, error: selectError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("clerk_id", clerkId)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Supabase select profile error:", selectError);
      return { success: false, error: selectError.message };
    }

    if (existingProfile) {
      return { success: true, profile: existingProfile };
    }

    // 2. Determine role. If there are no profiles in the system, make this user an admin.
    const { count, error: countError } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Supabase count profiles error:", countError);
    }

    const isFirstUser = count === 0;
    const role = isFirstUser ? "admin" : "writer";

    // 3. Create profile
    const { data: newProfile, error: insertError } = await supabaseAdmin
      .from("profiles")
      .insert({
        clerk_id: clerkId,
        username,
        display_name,
        avatar_url,
        role,
        bio: isFirstUser ? "Main Site Administrator" : "Writer",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert profile error:", insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true, profile: newProfile };
  } catch (error: any) {
    console.error("syncUserProfile failed:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}
