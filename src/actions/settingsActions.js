'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

export async function updateProfile(formData) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: 'Unauthorized' };

  const name = formData.get('name');
  const phone = formData.get('phone');

  if (!name || name.length < 2) return { error: 'Name must be at least 2 characters' };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, phone },
  });

  revalidatePath('/settings');
  return { success: true };
}

export async function changePassword(formData) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: 'Unauthorized' };

  const currentPassword = formData.get('currentPassword');
  const newPassword = formData.get('newPassword');
  const confirmPassword = formData.get('confirmPassword');

  if (newPassword !== confirmPassword) return { error: 'Passwords do not match' };
  if (newPassword.length < 8) return { error: 'Password must be at least 8 characters' };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) return { error: 'Current password is incorrect' };

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } });

  return { success: true };
}
