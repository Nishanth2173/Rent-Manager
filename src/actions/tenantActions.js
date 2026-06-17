'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { generateMonthlyRentForTenant } from '../utils/rentGeneration';
import { serialize } from '../utils/helpers';
import { z } from 'zod';

const TenantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile must be 10 digits'),
  propertyNo: z.string().min(1, 'Property number is required'),
  monthlyRent: z.coerce.number().min(100, 'Rent must be at least ₹100'),
  rentDueDay: z.coerce.number().min(1).max(31),
  joiningDate: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  notes: z.string().optional(),
});

export async function createTenant(formData) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: 'Unauthorized' };

  const raw = Object.fromEntries(formData);
  const parsed = TenantSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = parsed.data;
  try {
    const tenant = await prisma.tenant.create({
      data: { ...data, joiningDate: new Date(data.joiningDate), userId: session.user.id },
    });
    if (data.status === 'ACTIVE') await generateMonthlyRentForTenant(tenant);
    await prisma.auditLog.create({
      data: { action: 'CREATE', entity: 'Tenant', entityId: tenant.id, newData: data, userId: session.user.id, tenantId: tenant.id },
    });
    revalidatePath('/tenants');
    revalidatePath('/dashboard');
    return { success: true, tenantId: tenant.id };
  } catch (error) {
    if (error.code === 'P2002') return { error: 'Property number already exists' };
    return { error: 'Failed to create tenant' };
  }
}

export async function updateTenant(tenantId, formData) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: 'Unauthorized' };

  const raw = Object.fromEntries(formData);
  const parsed = TenantSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = parsed.data;
  try {
    const existing = await prisma.tenant.findFirst({ where: { id: tenantId, userId: session.user.id } });
    if (!existing) return { error: 'Tenant not found' };

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { ...data, joiningDate: new Date(data.joiningDate) },
    });
    await prisma.auditLog.create({
      data: { action: 'UPDATE', entity: 'Tenant', entityId: tenantId, oldData: serialize(existing), newData: data, userId: session.user.id, tenantId },
    });
    revalidatePath('/tenants');
    revalidatePath(`/tenants/${tenantId}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch {
    return { error: 'Failed to update tenant' };
  }
}

export async function deleteTenant(tenantId) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: 'Unauthorized' };

  try {
    const existing = await prisma.tenant.findFirst({ where: { id: tenantId, userId: session.user.id } });
    if (!existing) return { error: 'Tenant not found' };

    await prisma.tenant.delete({ where: { id: tenantId } });
    await prisma.auditLog.create({
      data: { action: 'DELETE', entity: 'Tenant', entityId: tenantId, oldData: serialize(existing), userId: session.user.id },
    });
    revalidatePath('/tenants');
    revalidatePath('/dashboard');
    return { success: true };
  } catch {
    return { error: 'Failed to delete tenant' };
  }
}

export async function getTenants({ search = '', status = '', page = 1, limit = 10 } = {}) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: 'Unauthorized' };

  const where = {
    userId: session.user.id,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search } },
        { propertyNo: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(status && { status }),
  };

  const [tenants, total] = await Promise.all([
    prisma.tenant.findMany({
      where,
      include: {
        rentRecords: {
          where: { status: { in: ['PENDING', 'OVERDUE'] } },
          select: { amount: true, status: true, rentMonth: true, dueDate: true },
        },
        _count: { select: { rentRecords: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.tenant.count({ where }),
  ]);

  return serialize({ tenants, total, pages: Math.ceil(total / limit) });
}

export async function getTenantById(tenantId) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const tenant = await prisma.tenant.findFirst({
    where: { id: tenantId, userId: session.user.id },
    include: {
      rentRecords: {
        include: { payments: true },
        orderBy: { rentMonth: 'desc' },
      },
    },
  });

  return tenant ? serialize(tenant) : null;
}
