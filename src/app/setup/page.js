import { prisma } from '../../lib/prisma';
import { redirect } from 'next/navigation';
import SetupClient from './SetupClient';

export default async function SetupPage() {
  // If a user already exists, redirect to login
  const count = await prisma.user.count();
  if (count > 0) {
    redirect('/login');
  }

  return <SetupClient />;
}
