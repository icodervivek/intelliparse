import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in$',
  '/sign-in/(.*)',        // allow /sign-in/sso-callback
  '/sign-up$',
  '/sign-up/(.*)',
  '/sso-callback$',
  '/sso-callback/(.*)',
])

const isProtectedRoute = createRouteMatcher(['/rag(.*)'])

export default clerkMiddleware(async (auth, req) => {
  
    if (isPublicRoute(req)) return;


  // Protect /rag routes - redirect to sign-in if not authenticated
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
  
  // Allow all other routes (public by default)
  // unless you want to protect all routes except sign-in/sign-up
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}