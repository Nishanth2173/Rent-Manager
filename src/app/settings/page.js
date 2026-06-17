import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '../../lib/prisma';
import SettingsClient from '../../features/settings/SettingsClient';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });

  return <SettingsClient user={user} />;
}
