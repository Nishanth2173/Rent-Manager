'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

export async function registerUser(formData) {
  const name = formData.get('name')?.toString().trim();
  const email = formData.get('email')?.toString().trim().toLowerCase();
  const password = formData.get('password')?.toString();
  const confirmPassword = formData.get('confirmPassword')?.toString();

  if (!name || name.length < 2) return { error: 'Name must be at least 2 characters' };
  if (!email || !email.includes('@')) return { error: 'Enter a valid email address' };
  if (!password || password.length < 8) return { error: 'Password must be at least 8 characters' };
  if (password !== confirmPassword) return { error: 'Passwords do not match' };

  // Check if any user already exists — if so, block setup
  const existingCount = await prisma.user.count();
  if (existingCount > 0) {
    return { error: 'Setup already complete. Please log in.' };
  }

  // Check email not taken
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: 'Email already registered' };

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: 'LANDLORD',
    },
  });

  return { success: true };
}
