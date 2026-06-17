'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', sub: 'Overview of your properties' },
  '/tenants': { title: 'Tenants', sub: 'Manage your tenants' },
  '/tenants/add': { title: 'Add Tenant', sub: 'Register a new tenant' },
  '/payments': { title: 'Payments', sub: 'Track rent payments' },
  '/reports': { title: 'Reports', sub: 'Analytics & insights' },
  '/settings': { title: 'Settings', sub: 'Account preferences' },
};

export default function Header({ onMenuClick }) {
  const pathname = usePathname();
  const info = pageTitles[pathname] || { title: 'RentFlow', sub: '' };

  return (
    <header className="h-16 border-b border-surface-border bg-surface-card/80 backdrop-blur-sm flex items-center px-6 gap-4 sticky top-0 z-20">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-slate-400 hover:text-white p-1"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1">
        <h1 className="text-base font-semibold text-white leading-none">{info.title}</h1>
        <p className="text-xs text-slate-500 mt-0.5">{info.sub}</p>
      </div>

      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
