import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getTenantById } from '../../../actions/tenantActions';
import { generateMonthlyRentForTenant, updateOverdueStatuses } from '../../../utils/rentGeneration';
import TenantDetailClient from '../../../features/tenants/TenantDetailClient';

export default async function TenantDetailPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const { id } = await params;
  
  // Auto-generate rent for this tenant
  const tenant = await getTenantById(id);
  if (!tenant) notFound();

  if (tenant.status === 'ACTIVE') {
    await generateMonthlyRentForTenant(tenant);
    await updateOverdueStatuses();
  }

  // Re-fetch with updated records
  const updatedTenant = await getTenantById(id);

  return <TenantDetailClient tenant={updatedTenant} />;
}
