import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { redirect } from 'next/navigation';
import { getDashboardStats } from '../../actions/paymentActions';
import DashboardClient from '../../features/dashboard/DashboardClient';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const stats = await getDashboardStats();

  return <DashboardClient stats={stats} userName={session.user.name} />;
}
