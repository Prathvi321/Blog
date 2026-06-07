import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define matches for routes requiring authentication
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/write(.*)",
  "/admin(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static assets
    "/((?!_next|[^?]*\\.(?:html|css|js|gif|svg|png|webp|jpg|jpeg|curl|ico|csv|docx|xlsx|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
