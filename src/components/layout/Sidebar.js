'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, CreditCard, BarChart3,
  Settings, LogOut, Building2, Bell, ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils/helpers';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tenants', label: 'Tenants', icon: Users },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-64 bg-surface-card border-r border-surface-border flex flex-col h-screen sticky top-0 z-30">
      {/* Logo */}
      <div className="p-6 border-b border-surface-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center" style={{ boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-display font-bold text-white">RentFlow</span>
            <p className="text-[10px] text-slate-500 leading-none">Property Manager</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn('sidebar-link', isActive && 'active')}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" style={{ width: '18px', height: '18px' }} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="ml-auto w-3.5 h-3.5 opacity-60" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-surface-border">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">
              {session?.user?.name?.charAt(0)?.toUpperCase() || 'L'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{session?.user?.name || 'Landlord'}</p>
            <p className="text-xs text-slate-500 truncate">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
