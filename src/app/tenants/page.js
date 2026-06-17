import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { redirect } from 'next/navigation';
import { getTenants } from '../../actions/tenantActions';
import TenantsClient from '../../features/tenants/TenantsClient';

export default async function TenantsPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const params = await searchParams;
  const search = params?.search || '';
  const status = params?.status || '';
  const page = Number(params?.page) || 1;

  const data = await getTenants({ search, status, page });

  return <TenantsClient initialData={data} />;
}
