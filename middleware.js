import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  // Protect these routes — /setup and /login are intentionally excluded
  matcher: [
    '/dashboard/:path*',
    '/tenants/:path*',
    '/payments/:path*',
    '/reports/:path*',
    '/settings/:path*',
  ],
};
