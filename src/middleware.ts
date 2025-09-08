import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protect selected routes via middleware
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/intake(.*)",
  "/check-ins(.*)",
  "/bills-records(.*)",
  "/demand-review(.*)",
  "/litigation(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect(); // redirects unauthenticated users
  }
});

// Ensure middleware runs on all app routes and API, excluding static files and _next
export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
