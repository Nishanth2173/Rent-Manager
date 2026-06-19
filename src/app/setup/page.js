import { prisma } from '../../lib/prisma';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import SetupClient from './SetupClient';

export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  try {
    // If already logged in, go to dashboard
    const session = await getServerSession(authOptions);
    if (session) {
      redirect('/dashboard');
    }

    // If users already exist, setup is done — go to login
    const count = await prisma.user.count();
    if (count > 0) {
      redirect('/login');
    }

    // No users exist — show setup form
    return <SetupClient />;

  } catch (error) {
    console.error('Setup page error:', error);
    return <SetupClient />;
  }
}
