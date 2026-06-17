'use client';

import { motion } from 'framer-motion';
import {
  Users, IndianRupee, Clock, AlertTriangle,
  UserCheck, TrendingUp, CalendarClock, Bell,
  RefreshCw, CheckCircle2,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import { CollectionAreaChart, StatusDonutChart } from '../../components/charts/DashboardCharts';
import { formatCurrency, formatDate, formatMonthYear } from '../../utils/helpers';
import StatusBadge from '../../components/ui/StatusBadge';
import Link from 'next/link';

export default function DashboardClient({ stats, userName }) {
  if (!stats) return <div className="text-slate-400">Failed to load dashboard</div>;

  const {
    totalTenants, activeTenants, currentMonthCollected,
    totalPending, totalOverdue, collectionRate,
    overdueRecords, last6MonthsData, tenantsWithMultipleMonthsDue,
    upcomingDues, newRecordsGenerated,
  } = stats;

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const monthName = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-display font-bold text-white">
              {greeting}, {userName?.split(' ')[0]} 👋
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now)}
            </p>
          </div>

          {/* Auto-generation status pill */}
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">
              Auto rent generation active
            </span>
            {newRecordsGenerated > 0 && (
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                +{newRecordsGenerated} new this session
              </span>
            )}
          </div>
        </div>

        {/* Monthly auto-generation info bar */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 bg-surface-card border border-surface-border rounded-xl px-4 py-2.5">
          <RefreshCw className="w-3.5 h-3.5 text-brand-400 shrink-0" />
          <span>
            Rent records for <span className="text-slate-300 font-medium">{monthName}</span> are auto-generated for all active tenants.
            {' '}Missed months are backfilled automatically on login.
            {' '}Cron job runs on the <span className="text-slate-300 font-medium">1st of every month</span>.
          </span>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard title="Total Tenants" value={totalTenants} subtitle={`${activeTenants} active`} icon={Users} color="brand" delay={0} />
        <StatCard title="This Month Collected" value={formatCurrency(currentMonthCollected)} subtitle={`${collectionRate}% collection rate`} icon={IndianRupee} color="emerald" delay={0.05} />
        <StatCard title="Total Pending" value={formatCurrency(totalPending)} subtitle="Across all months" icon={Clock} color="amber" delay={0.1} />
        <StatCard title="Overdue Amount" value={formatCurrency(totalOverdue)} subtitle={`${overdueRecords.length} overdue records`} icon={AlertTriangle} color="red" delay={0.15} />
        <StatCard title="Active Tenants" value={activeTenants} subtitle={`of ${totalTenants} total`} icon={UserCheck} color="sky" delay={0.2} />
        <StatCard title="Collection Rate" value={`${collectionRate}%`} subtitle="This month" icon={TrendingUp} color="brand" delay={0.25} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-1">Monthly Collection</h3>
          <p className="text-xs text-slate-500 mb-6">Last 6 months revenue trend</p>
          <CollectionAreaChart data={last6MonthsData} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-1">Payment Status</h3>
          <p className="text-xs text-slate-500 mb-6">Current month breakdown</p>
          <StatusDonutChart
            paid={Math.round(collectionRate)}
            pending={Math.max(0, 100 - collectionRate - 10)}
            overdue={Math.min(10, 100 - collectionRate)}
          />
        </motion.div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card">
          <div className="p-5 border-b border-surface-border flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-semibold text-white">Overdue Rent</h3>
            {overdueRecords.length > 0 && (
              <span className="ml-auto text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-medium">
                {overdueRecords.length} records
              </span>
            )}
          </div>
          <div className="divide-y divide-surface-border">
            {overdueRecords.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                <p className="text-slate-500 text-sm">No overdue rent 🎉</p>
              </div>
            ) : (
              overdueRecords.slice(0, 5).map((record) => (
                <Link key={record.id} href={`/tenants/${record.tenantId}`}>
                  <div className="px-5 py-3.5 flex items-center justify-between hover:bg-surface-elevated/40 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">{record.tenant.name}</p>
                      <p className="text-xs text-slate-500">{record.tenant.propertyNo} • Rent for {formatMonthYear(record.rentMonth)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-400">{formatCurrency(record.amount)}</p>
                      <p className="text-xs text-slate-500">Collect by {formatDate(record.dueDate)}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          {overdueRecords.length > 5 && (
            <div className="p-4 border-t border-surface-border">
              <Link href="/payments?status=OVERDUE" className="text-xs text-brand-400 hover:text-brand-300 font-medium">
                View all {overdueRecords.length} overdue →
              </Link>
            </div>
          )}
        </motion.div>

        {/* Multiple months due */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card">
          <div className="p-5 border-b border-surface-border flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Multiple Months Due</h3>
            {tenantsWithMultipleMonthsDue.length > 0 && (
              <span className="ml-auto text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">
                {tenantsWithMultipleMonthsDue.length} tenants
              </span>
            )}
          </div>
          <div className="divide-y divide-surface-border">
            {tenantsWithMultipleMonthsDue.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                <p className="text-slate-500 text-sm">All tenants are up to date ✓</p>
              </div>
            ) : (
              tenantsWithMultipleMonthsDue.slice(0, 5).map((tenant) => (
                <Link key={tenant.id} href={`/tenants/${tenant.id}`}>
                  <div className="px-5 py-3.5 flex items-center justify-between hover:bg-surface-elevated/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">{tenant.name}</p>
                      <p className="text-xs text-amber-400 font-medium">{tenant.monthsDue} months due</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-amber-400">{formatCurrency(tenant.totalDue)}</p>
                      <p className="text-xs text-slate-500">{tenant.propertyNo}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Upcoming dues */}
      {upcomingDues.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card">
          <div className="p-5 border-b border-surface-border flex items-center gap-2">
            <Bell className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-white">Upcoming Due (Next 7 Days)</h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingDues.map((record) => (
              <Link key={record.id} href={`/tenants/${record.tenantId}`}>
                <div className="bg-surface-elevated rounded-xl p-3.5 border border-surface-border hover:border-sky-500/30 transition-colors">
                  <p className="text-sm font-medium text-white">{record.tenant.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{record.tenant.propertyNo}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-sky-400 font-medium">Due {formatDate(record.dueDate)}</p>
                    <p className="text-xs font-semibold text-white">{formatCurrency(record.amount)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
