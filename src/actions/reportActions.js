'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { serialize } from '../utils/helpers';

export async function getReportData({ year, month } = {}) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const now = new Date();
  const targetYear = year || now.getFullYear();
  const targetMonth = month !== undefined ? month : now.getMonth();

  const startDate = new Date(targetYear, targetMonth, 1);
  const endDate = new Date(targetYear, targetMonth + 1, 0);

  const records = await prisma.rentRecord.findMany({
    where: {
      tenant: { userId: session.user.id },
      rentMonth: { gte: startDate, lte: endDate },
    },
    include: {
      tenant: { select: { name: true, propertyNo: true, mobile: true } },
      payments: true,
    },
    orderBy: { dueDate: 'asc' },
  });

  const summary = {
    totalExpected: records.reduce((s, r) => s + Number(r.amount), 0),
    totalCollected: records.filter((r) => r.status === 'PAID').reduce((s, r) => s + Number(r.paidAmount || 0), 0),
    totalPending: records.filter((r) => r.status !== 'PAID').reduce((s, r) => s + Number(r.amount), 0),
    paid: records.filter((r) => r.status === 'PAID').length,
    pending: records.filter((r) => r.status === 'PENDING').length,
    overdue: records.filter((r) => r.status === 'OVERDUE').length,
  };

  return serialize({ records, summary, month: startDate });
}

export async function getAuditLogs({ page = 1, limit = 20 } = {}) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const where = { userId: session.user.id };
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { tenant: { select: { name: true, propertyNo: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return serialize({ logs, total, pages: Math.ceil(total / limit) });
}
