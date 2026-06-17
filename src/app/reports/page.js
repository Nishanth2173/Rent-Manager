import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { redirect } from 'next/navigation';
import { getReportData, getAuditLogs } from '../../actions/reportActions';
import ReportsClient from '../../features/reports/ReportsClient';

export default async function ReportsPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const params = await searchParams;
  const now = new Date();
  const year = Number(params?.year) || now.getFullYear();
  const month = params?.month !== undefined ? Number(params.month) : now.getMonth();

  const [reportData, auditData] = await Promise.all([
    getReportData({ year, month }),
    getAuditLogs({ page: 1, limit: 10 }),
  ]);

  return <ReportsClient reportData={reportData} auditData={auditData} currentYear={year} currentMonth={month} />;
}
