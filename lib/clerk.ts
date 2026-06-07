import { auth } from "@clerk/nextjs/server";

export async function getUserRole(): Promise<"admin" | "writer"> {
  try {
    const session = await auth();
    const sessionClaims = session?.sessionClaims;
    const metadata = sessionClaims?.publicMetadata as { role?: string } | undefined;
    
    // Default to admin in development if Clerk is unconfigured, to allow testing
    if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("mock")) {
      return "admin";
    }
    
    return (metadata?.role as "admin" | "writer") || "writer";
  } catch (e) {
    return "admin"; // safe fallback for local dev environments
  }
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "admin";
}
