import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { redirect } from 'next/navigation';
import { getRentRecords } from '../../actions/paymentActions';
import PaymentsClient from '../../features/payments/PaymentsClient';

export default async function PaymentsPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const params = await searchParams;
  const status = params?.status || '';
  const page = Number(params?.page) || 1;

  const data = await getRentRecords({ status, page });

  return <PaymentsClient initialData={data} />;
}
