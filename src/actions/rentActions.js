'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { serialize } from '../utils/helpers';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

/**
 * Due date = rentDueDay of the MONTH AFTER rentMonth.
 * e.g. May rent → due on June 5th (if rentDueDay = 5)
 */
function getDueDate(year, month, rentDueDay) {
  // month+1 = next month (JS Date handles December→January rollover)
  return new Date(year, month + 1, rentDueDay);
}

/**
 * Add rent records for specific past months manually.
 * months = [{ year, month (0-indexed), amount }]
 */
export async function addMultiplePastRentRecords(tenantId, months) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: 'Unauthorized' };

  const tenant = await prisma.tenant.findFirst({
    where: { id: tenantId, userId: session.user.id },
  });
  if (!tenant) return { error: 'Tenant not found' };

  const results = { added: 0, skipped: 0, errors: [] };
  const now = new Date();

  for (const { year, month, amount } of months) {
    const rentMonth = new Date(year, month, 1);
    // Due date is next month's collection day
    const dueDate = getDueDate(year, month, tenant.rentDueDay);
    const isPastDue = dueDate < now;

    const existing = await prisma.rentRecord.findUnique({
      where: { tenantId_rentMonth: { tenantId, rentMonth } },
    });

    if (existing) {
      results.skipped++;
      results.errors.push(
        `${MONTH_NAMES[month]} ${year} already exists (${existing.status})`
      );
      continue;
    }

    await prisma.rentRecord.create({
      data: {
        tenantId,
        rentMonth,
        dueDate,
        amount: amount || tenant.monthlyRent,
        status: isPastDue ? 'OVERDUE' : 'PENDING',
      },
    });
    results.added++;
  }

  if (results.added > 0) {
    await prisma.auditLog.create({
      data: {
        action: 'BULK_ADD_PAST_RENT',
        entity: 'Tenant',
        entityId: tenantId,
        newData: { added: results.added, skipped: results.skipped },
        userId: session.user.id,
        tenantId,
      },
    });
  }

  revalidatePath(`/tenants/${tenantId}`);
  revalidatePath('/dashboard');
  revalidatePath('/payments');
  return { success: true, ...results };
}
