'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, FileText, ChevronLeft, ChevronRight, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate, formatMonthYear } from '../../utils/helpers';
import StatusBadge from '../../components/ui/StatusBadge';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function ReportsClient({ reportData, auditData, currentYear, currentMonth }) {
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);

  const { records = [], summary = {}, month: reportMonth } = reportData || {};

  const exportCSV = () => {
    const headers = ['Tenant', 'Property', 'Month', 'Due Date', 'Amount', 'Status', 'Paid Date'];
    const rows = records.map((r) => [
      r.tenant.name,
      r.tenant.propertyNo,
      formatMonthYear(r.rentMonth),
      formatDate(r.dueDate),
      Number(r.amount),
      r.status,
      r.paidAt ? formatDate(r.paidAt) : '',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rent-report-${MONTHS[month]}-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const changeMonth = (dir) => {
    let newMonth = month + dir;
    let newYear = year;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }
    setMonth(newMonth);
    setYear(newYear);
    window.location.href = `/reports?year=${newYear}&month=${newMonth}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white">Monthly Reports</h2>
          <p className="text-sm text-slate-400">{MONTHS[month]} {year} summary</p>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <button onClick={() => changeMonth(-1)} className="w-8 h-8 rounded-lg bg-surface-elevated border border-surface-border text-slate-400 hover:text-white flex items-center justify-center">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-white px-2">{MONTHS[month]} {year}</span>
          <button onClick={() => changeMonth(1)} className="w-8 h-8 rounded-lg bg-surface-elevated border border-surface-border text-slate-400 hover:text-white flex items-center justify-center">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={exportCSV} className="btn-secondary ml-2">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Expected', value: formatCurrency(summary.totalExpected || 0), icon: BarChart3, color: 'text-brand-400 bg-brand-500/10 border-brand-500/20' },
          { label: 'Collected', value: formatCurrency(summary.totalCollected || 0), icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Pending', value: formatCurrency(summary.totalPending || 0), icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
          { label: 'Collection Rate', value: summary.totalExpected ? `${Math.round((summary.totalCollected / summary.totalExpected) * 100)}%` : '0%', icon: AlertTriangle, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border mb-3 ${card.color}`}>
              <card.icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-display font-bold text-white">{card.value}</p>
            <p className="text-xs text-slate-400 mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Records Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
        <div className="p-5 border-b border-surface-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Rent Records — {MONTHS[month]} {year}</h3>
          <div className="flex gap-3 text-xs text-slate-400">
            <span className="text-emerald-400">✓ {summary.paid || 0} paid</span>
            <span className="text-amber-400">⏳ {summary.pending || 0} pending</span>
            <span className="text-red-400">⚠ {summary.overdue || 0} overdue</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="table-header text-left px-5 py-3">Tenant</th>
                <th className="table-header text-left px-4 py-3 hidden sm:table-cell">Property</th>
                <th className="table-header text-left px-4 py-3">Amount</th>
                <th className="table-header text-left px-4 py-3">Status</th>
                <th className="table-header text-left px-4 py-3 hidden md:table-cell">Due Date</th>
                <th className="table-header text-left px-4 py-3 hidden lg:table-cell">Paid On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-sm">No records for this month</td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-surface-elevated/30 transition-colors">
                    <td className="table-cell px-5 font-medium text-white">{record.tenant.name}</td>
                    <td className="table-cell px-4 hidden sm:table-cell text-slate-400 font-mono text-xs">{record.tenant.propertyNo}</td>
                    <td className="table-cell px-4 font-semibold text-white">{formatCurrency(record.amount)}</td>
                    <td className="table-cell px-4"><StatusBadge status={record.status} /></td>
                    <td className="table-cell px-4 hidden md:table-cell text-slate-400 text-xs">{formatDate(record.dueDate)}</td>
                    <td className="table-cell px-4 hidden lg:table-cell text-slate-400 text-xs">{record.paidAt ? formatDate(record.paidAt) : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Audit Logs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card">
        <div className="p-5 border-b border-surface-border flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
        </div>
        <div className="divide-y divide-surface-border">
          {(auditData?.logs || []).length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-sm">No activity yet</div>
          ) : (
            (auditData?.logs || []).map((log) => (
              <div key={log.id} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">
                    <span className={`font-medium ${log.action === 'DELETE' ? 'text-red-400' : log.action === 'PAYMENT' ? 'text-emerald-400' : 'text-brand-400'}`}>
                      {log.action}
                    </span>{' '}
                    {log.entity}
                    {log.tenant && ` — ${log.tenant.name}`}
                  </p>
                  <p className="text-xs text-slate-500">{formatDate(log.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
