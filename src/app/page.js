import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';
import { prisma } from '../lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  try {
    // Check if any user exists in the database
    const userCount = await prisma.user.count();

    // No users at all → go to setup
    if (userCount === 0) {
      redirect('/setup');
    }

    // Users exist → check if logged in
    const session = await getServerSession(authOptions);
    if (session) {
      redirect('/dashboard');
    }

    // Not logged in → go to login
    redirect('/login');

  } catch (error) {
    // If DB is unreachable during build/cold start, default to login
    console.error('HomePage DB check failed:', error);
    redirect('/login');
  }
}
