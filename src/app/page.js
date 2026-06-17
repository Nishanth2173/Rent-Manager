import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';
import { prisma } from '../lib/prisma';

export default async function HomePage() {
  // If no users exist at all, go to setup
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    redirect('/setup');
  }

  // If logged in, go to dashboard
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/dashboard');
  }

  // Otherwise go to login
  redirect('/login');
}
