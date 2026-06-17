import { prisma } from '../lib/prisma';

/**
 * RENT LOGIC:
 * - Tenant joins in May → May's rent is due in June (next month)
 * - June's rent is due in July, and so on.
 * - rentDueDay = the day of the NEXT month when rent is collected.
 *
 * Example: joiningDate = May 1, rentDueDay = 5
 *   → May rent record: dueDate = June 5
 *   → June rent record: dueDate = July 5
 *   → July rent record: dueDate = August 5
 */

function getDueDate(rentMonth, rentDueDay) {
  // Due date is the rentDueDay of the NEXT month after rentMonth
  const due = new Date(rentMonth.getFullYear(), rentMonth.getMonth() + 1, rentDueDay);
  return due;
}

/**
 * Generate rent records for a single tenant.
 * Creates one record per month from joining month up to current month.
 * Each record's dueDate is the rentDueDay of the following month.
 */
export async function generateMonthlyRentForTenant(tenant) {
  const now = new Date();
  const joiningDate = new Date(tenant.joiningDate);

  // Start from the month the tenant joined
  const startMonth = new Date(joiningDate.getFullYear(), joiningDate.getMonth(), 1);
  // Generate up to and including the current month
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const created = [];
  const cursor = new Date(startMonth);

  while (cursor <= currentMonth) {
    const rentMonth = new Date(cursor);
    const dueDate = getDueDate(rentMonth, tenant.rentDueDay);
    const isPastDue = dueDate < now;

    const existing = await prisma.rentRecord.findUnique({
      where: { tenantId_rentMonth: { tenantId: tenant.id, rentMonth } },
    });

    if (!existing) {
      const record = await prisma.rentRecord.create({
        data: {
          tenantId: tenant.id,
          rentMonth,
          dueDate,
          amount: tenant.monthlyRent,
          // If the due date (next month's collection day) has passed → OVERDUE
          status: isPastDue ? 'OVERDUE' : 'PENDING',
        },
      });
      created.push(record);
    }

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return created;
}

/**
 * Generate rent records for ALL active tenants under a landlord.
 */
export async function generateMonthlyRentForAll(userId) {
  const tenants = await prisma.tenant.findMany({
    where: { userId, status: 'ACTIVE' },
  });

  let totalCreated = 0;
  for (const tenant of tenants) {
    const created = await generateMonthlyRentForTenant(tenant);
    totalCreated += created.length;
  }
  return totalCreated;
}

/**
 * Update PENDING records whose dueDate has passed → OVERDUE.
 * dueDate is always in the next month, so this fires after that day passes.
 */
export async function updateOverdueStatuses() {
  const updated = await prisma.rentRecord.updateMany({
    where: {
      status: 'PENDING',
      dueDate: { lt: new Date() },
    },
    data: { status: 'OVERDUE' },
  });
  return updated.count;
}

/**
 * Get cumulative unpaid dues for a tenant.
 */
export async function getTenantDues(tenantId) {
  const unpaidRecords = await prisma.rentRecord.findMany({
    where: { tenantId, status: { in: ['PENDING', 'OVERDUE'] } },
    orderBy: { rentMonth: 'asc' },
  });
  const totalDue = unpaidRecords.reduce((sum, r) => sum + Number(r.amount), 0);
  return { unpaidRecords, totalDue, monthsCount: unpaidRecords.length };
}
