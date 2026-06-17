'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { generateMonthlyRentForAll, updateOverdueStatuses } from '../utils/rentGeneration';
import { serialize } from '../utils/helpers';

export async function markAsPaid(rentRecordId, { amount, method = 'CASH', reference = '', notes = '' } = {}) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: 'Unauthorized' };

  try {
    const record = await prisma.rentRecord.findFirst({
      where: { id: rentRecordId, tenant: { userId: session.user.id } },
      include: { tenant: true },
    });
    if (!record) return { error: 'Record not found' };
    if (record.status === 'PAID') return { error: 'Already marked as paid' };

    const payAmount = amount || Number(record.amount);
    const now = new Date();

    await prisma.$transaction([
      prisma.rentRecord.update({
        where: { id: rentRecordId },
        data: { status: 'PAID', paidAt: now, paidAmount: payAmount },
      }),
      prisma.payment.create({
        data: { rentRecordId, amount: payAmount, paymentDate: now, method, reference, notes },
      }),
      prisma.auditLog.create({
        data: {
          action: 'PAYMENT', entity: 'RentRecord', entityId: rentRecordId,
          newData: { amount: payAmount, method, reference },
          userId: session.user.id, tenantId: record.tenantId,
        },
      }),
    ]);

    revalidatePath('/payments');
    revalidatePath('/dashboard');
    revalidatePath(`/tenants/${record.tenantId}`);
    return { success: true };
  } catch {
    return { error: 'Failed to mark as paid' };
  }
}

export async function getRentRecords({ tenantId, status, month, page = 1, limit = 20 } = {}) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: 'Unauthorized' };

  const where = {
    tenant: { userId: session.user.id },
    ...(tenantId && { tenantId }),
    ...(status && { status }),
    ...(month && {
      rentMonth: {
        gte: new Date(month),
        lt: new Date(new Date(month).setMonth(new Date(month).getMonth() + 1)),
      },
    }),
  };

  const [records, total] = await Promise.all([
    prisma.rentRecord.findMany({
      where,
      include: {
        tenant: { select: { name: true, propertyNo: true, mobile: true } },
        payments: true,
      },
      orderBy: [{ dueDate: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.rentRecord.count({ where }),
  ]);

  return serialize({ records, total, pages: Math.ceil(total / limit) });
}

export async function getDashboardStats() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const newRecordsGenerated = await generateMonthlyRentForAll(session.user.id);
  await updateOverdueStatuses();

  const userId = session.user.id;
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalTenants, activeTenants,
    currentMonthPaid, currentMonthPending,
    overdueRecords, allTimeCollected,
    last6MonthsData, pendingTenants,
    totalPending, totalOverdue, upcomingDues,
  ] = await Promise.all([
    prisma.tenant.count({ where: { userId } }),
    prisma.tenant.count({ where: { userId, status: 'ACTIVE' } }),

    prisma.rentRecord.aggregate({
      where: { tenant: { userId }, status: 'PAID', rentMonth: { gte: currentMonthStart } },
      _sum: { paidAmount: true },
    }),
    prisma.rentRecord.aggregate({
      where: { tenant: { userId }, status: { in: ['PENDING', 'OVERDUE'] }, rentMonth: { gte: currentMonthStart } },
      _sum: { amount: true },
    }),

    prisma.rentRecord.findMany({
      where: { tenant: { userId }, status: 'OVERDUE' },
      include: { tenant: { select: { name: true, propertyNo: true, mobile: true } } },
      orderBy: { dueDate: 'asc' },
      take: 10,
    }),

    prisma.payment.aggregate({
      where: { rentRecord: { tenant: { userId } } },
      _sum: { amount: true },
    }),

    Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        return prisma.payment.aggregate({
          where: {
            rentRecord: { tenant: { userId }, rentMonth: { gte: monthStart, lte: monthEnd } },
            paymentDate: { gte: monthStart, lte: monthEnd },
          },
          _sum: { amount: true },
        }).then((r) => ({
          month: monthStart.toISOString(),
          collected: Number(r._sum.amount || 0),
        }));
      })
    ),

    prisma.tenant.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        rentRecords: {
          where: { status: { in: ['PENDING', 'OVERDUE'] } },
          select: { amount: true, status: true, rentMonth: true },
        },
      },
    }),

    prisma.rentRecord.aggregate({
      where: { tenant: { userId }, status: { in: ['PENDING', 'OVERDUE'] } },
      _sum: { amount: true },
    }),
    prisma.rentRecord.aggregate({
      where: { tenant: { userId }, status: 'OVERDUE' },
      _sum: { amount: true },
    }),

    prisma.rentRecord.findMany({
      where: {
        tenant: { userId },
        status: 'PENDING',
        dueDate: { gte: now, lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      },
      include: { tenant: { select: { name: true, propertyNo: true } } },
      orderBy: { dueDate: 'asc' },
    }),
  ]);

  const tenantsWithMultipleMonthsDue = pendingTenants
    .filter((t) => t.rentRecords.length >= 2)
    .map((t) => ({
      id: t.id,
      name: t.name,
      propertyNo: t.propertyNo,
      mobile: t.mobile,
      totalDue: t.rentRecords.reduce((s, r) => s + Number(r.amount), 0),
      monthsDue: t.rentRecords.length,
    }));

  const collectedAmt = Number(currentMonthPaid._sum.paidAmount || 0);
  const pendingAmt = Number(currentMonthPending._sum.amount || 0);
  const collectionRate = (collectedAmt + pendingAmt) > 0
    ? Math.round((collectedAmt / (collectedAmt + pendingAmt)) * 100)
    : 0;

  // Serialize everything — convert Decimal, Date to plain values
  return serialize({
    totalTenants,
    activeTenants,
    currentMonthCollected: collectedAmt,
    totalPending: Number(totalPending._sum.amount || 0),
    totalOverdue: Number(totalOverdue._sum.amount || 0),
    allTimeCollected: Number(allTimeCollected._sum.amount || 0),
    collectionRate,
    overdueRecords,
    last6MonthsData: last6MonthsData.reverse(),
    newRecordsGenerated,
    tenantsWithMultipleMonthsDue,
    upcomingDues,
  });
}

export async function getPaymentHistory({ page = 1, limit = 20 } = {}) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: 'Unauthorized' };

  const where = { rentRecord: { tenant: { userId: session.user.id } } };
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        rentRecord: {
          include: { tenant: { select: { name: true, propertyNo: true } } },
        },
      },
      orderBy: { paymentDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ]);

  return serialize({ payments, total, pages: Math.ceil(total / limit) });
}
