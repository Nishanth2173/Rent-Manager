import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { redirect } from 'next/navigation';
import TenantForm from '../../../features/tenants/TenantForm';

export default async function AddTenantPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return <TenantForm />;
}
