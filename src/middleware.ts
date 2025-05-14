
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/', 
  '/triders(.*)',
  // Add any other routes you want to protect here
]);

export default clerkMiddleware((auth, req: NextRequest) => {
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
