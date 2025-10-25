import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Only protect specific routes, leave everything else public
const isProtectedRoute = createRouteMatcher(['/rag(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // Only protect /rag routes - everything else is public
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}