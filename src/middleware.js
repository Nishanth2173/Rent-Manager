import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: ['/dashboard/:path*', '/tenants/:path*', '/payments/:path*', '/reports/:path*', '/settings/:path*'],
};
