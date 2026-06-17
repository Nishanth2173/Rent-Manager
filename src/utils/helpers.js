import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

export function formatDate(date) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatMonthYear(date) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function getOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function getStatusColor(status) {
  switch (status) {
    case 'PAID':
      return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'PENDING':
      return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'OVERDUE':
      return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'ACTIVE':
      return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'INACTIVE':
      return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    default:
      return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  }
}

export function getDaysOverdue(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = Math.floor((now - due) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

export function generateMonthsArray(startDate, endDate = new Date()) {
  const months = [];
  const start = new Date(startDate);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setDate(1);

  while (start <= end) {
    months.push(new Date(start));
    start.setMonth(start.getMonth() + 1);
  }
  return months;
}

export function getCurrentMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function getPreviousMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 1, 1);
}

export function isOverdue(dueDate, status) {
  return status !== 'PAID' && new Date(dueDate) < new Date();
}


/**
 * Serialize Prisma objects for client components.
 * Converts Decimal → string, Date → ISO string, recursively.
 */
export function serialize(obj) {
  return JSON.parse(JSON.stringify(obj, (_, value) => {
    // Prisma Decimal has toFixed method
    if (value !== null && typeof value === 'object' && typeof value.toFixed === 'function') {
      return value.toString();
    }
    // Convert Date to ISO string
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }));
}
