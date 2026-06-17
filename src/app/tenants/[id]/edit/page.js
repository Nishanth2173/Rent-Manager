import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getTenantById } from '../../../../actions/tenantActions';
import TenantForm from '../../../../features/tenants/TenantForm';

export default async function EditTenantPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const { id } = await params;
  const tenant = await getTenantById(id);
  if (!tenant) notFound();

  return <TenantForm tenant={tenant} />;
}
