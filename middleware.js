import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  // Only protect these routes
  // /setup, /login, /api are intentionally NOT here
  matcher: [
    '/dashboard/:path*',
    '/tenants/:path*',
    '/payments/:path*',
    '/reports/:path*',
    '/settings/:path*',
  ],
};
