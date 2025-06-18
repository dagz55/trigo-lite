
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// This is a basic middleware function.
// It currently does nothing and allows all requests to pass through.
// If you need to protect routes in the future, you can add your logic here.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// If you want to apply middleware to specific paths, you can uncomment and configure the matcher.
// export const config = {
//   matcher: ['/dashboard/:path*'], // Example: protect all routes under /dashboard
// };
