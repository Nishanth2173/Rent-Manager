'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Edit, Phone, Home, Calendar, IndianRupee,
  CheckCircle, AlertTriangle, FileText, CalendarPlus,
  Clock,
} from 'lucide-react';
import { formatCurrency, formatDate, formatMonthYear, getOrdinal } from '../../utils/helpers';
import StatusBadge from '../../components/ui/StatusBadge';
import PayRentModal from '../../components/shared/PayRentModal';
import AddPastRentModal from '../../components/shared/AddPastRentModal';

export default function TenantDetailClient({ tenant }) {
  const router = useRouter();
  const [payRecord, setPayRecord] = useState(null);
  const [showAddPast, setShowAddPast] = useState(false);

  const unpaidRecords = tenant.rentRecords.filter((r) => r.status !== 'PAID');
  const paidRecords = tenant.rentRecords.filter((r) => r.status === 'PAID');
  const overdueRecords = unpaidRecords.filter((r) => r.status === 'OVERDUE');
  const pendingRecords = unpaidRecords.filter((r) => r.status === 'PENDING');
  const totalDue = unpaidRecords.reduce((s, r) => s + Number(r.amount), 0);
  const totalCollected = paidRecords.reduce((s, r) => s + Number(r.paidAmount || r.amount), 0);
  const monthsDue = unpaidRecords.length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/tenants">
          <button className="w-9 h-9 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div className="flex-1">
          <h2 className="text-xl font-display font-bold text-white">{tenant.name}</h2>
          <p className="text-sm text-slate-400">{tenant.propertyNo} • Joined {formatDate(tenant.joiningDate)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddPast(true)}
            className="btn-secondary"
            title="Add past months rent due"
          >
            <CalendarPlus className="w-4 h-4" />
            Add Past Due
          </button>
          <Link href={`/tenants/${tenant.id}/edit`}>
            <button className="btn-secondary">
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          {/* Profile */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{tenant.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">{tenant.name}</h3>
                <StatusBadge status={tenant.status} />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-slate-300">{tenant.mobile}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Home className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-slate-300">{tenant.propertyNo}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-slate-300">
                  Collected on <span className="text-amber-400 font-medium">{getOrdinal(tenant.rentDueDay)}</span> of next month
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <IndianRupee className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-white font-semibold">{formatCurrency(tenant.monthlyRent)}/month</span>
              </div>
            </div>
            {tenant.notes && (
              <div className="mt-4 pt-4 border-t border-surface-border">
                <p className="text-xs text-slate-500 mb-1">Notes</p>
                <p className="text-sm text-slate-300">{tenant.notes}</p>
              </div>
            )}
          </motion.div>

          {/* Due Summary Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Due Summary</h3>

            {/* Big due counter */}
            {monthsDue > 0 ? (
              <div className="text-center py-4 mb-4 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                <p className="text-4xl font-display font-bold text-amber-400">{monthsDue}</p>
                <p className="text-sm text-slate-400 mt-1">Month{monthsDue !== 1 ? 's' : ''} Rent Due</p>
                <p className="text-xl font-bold text-white mt-2">{formatCurrency(totalDue)}</p>
                <p className="text-xs text-slate-500 mt-0.5">Total Outstanding</p>
              </div>
            ) : (
              <div className="text-center py-4 mb-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                <p className="text-sm font-medium text-emerald-400">All Clear!</p>
                <p className="text-xs text-slate-500 mt-0.5">No pending dues</p>
              </div>
            )}

            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Overdue</span>
                <span className="text-xs font-semibold text-red-400">{overdueRecords.length} month{overdueRecords.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Pending</span>
                <span className="text-xs font-semibold text-amber-400">{pendingRecords.length} month{pendingRecords.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-surface-border">
                <span className="text-xs text-slate-400">Total Collected</span>
                <span className="text-xs font-semibold text-emerald-400">{formatCurrency(totalCollected)}</span>
              </div>
            </div>

            {/* Add past due prompt */}
            <button
              onClick={() => setShowAddPast(true)}
              className="w-full mt-4 py-2.5 rounded-xl border border-dashed border-brand-500/30 text-brand-400 hover:bg-brand-500/10 text-xs flex items-center justify-center gap-2 transition-all"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              Add past months due
            </button>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Pending / Overdue Records */}
          {unpaidRecords.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card">
              <div className="p-5 border-b border-surface-border flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Pending / Overdue</h3>
                <span className="ml-auto text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">
                  {unpaidRecords.length} record{unpaidRecords.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="divide-y divide-surface-border">
                {unpaidRecords
                  .sort((a, b) => new Date(a.rentMonth) - new Date(b.rentMonth))
                  .map((record, idx) => (
                    <div key={record.id} className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Month counter badge */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                          record.status === 'OVERDUE'
                            ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                            : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            Rent for {formatMonthYear(record.rentMonth)}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Collect by {formatDate(record.dueDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-auto">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">{formatCurrency(record.amount)}</p>
                          <StatusBadge status={record.status} />
                        </div>
                        <button
                          onClick={() => setPayRecord({ ...record, tenant: { name: tenant.name } })}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all shrink-0"
                          style={{ background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', boxShadow: '0 0 14px rgba(52,211,153,0.2)' }}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Mark Paid
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Cumulative total bar */}
              <div className="p-4 border-t border-surface-border bg-surface-elevated/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-slate-400">
                    <span className="text-white font-semibold">{monthsDue} months</span> outstanding
                  </span>
                </div>
                <span className="text-base font-bold text-amber-400">{formatCurrency(totalDue)} total due</span>
              </div>
            </motion.div>
          )}

          {/* Payment History */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card">
            <div className="p-5 border-b border-surface-border flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-white">Payment History</h3>
              <span className="ml-auto text-xs text-slate-500">{paidRecords.length} paid</span>
            </div>
            {paidRecords.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-sm">No payments recorded yet</div>
            ) : (
              <div className="divide-y divide-surface-border">
                {paidRecords
                  .sort((a, b) => new Date(b.rentMonth) - new Date(a.rentMonth))
                  .map((record) => (
                    <div key={record.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{formatMonthYear(record.rentMonth)}</p>
                          <p className="text-xs text-slate-500">Paid {formatDate(record.paidAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-400">{formatCurrency(record.paidAmount || record.amount)}</p>
                        {record.payments?.[0]?.method && (
                          <p className="text-xs text-slate-500">{record.payments[0].method.replace('_', ' ')}</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Pay Modal */}
      {payRecord && (
        <PayRentModal
          record={payRecord}
          onClose={() => setPayRecord(null)}
          onSuccess={() => { setPayRecord(null); router.refresh(); }}
        />
      )}

      {/* Add Past Due Modal */}
      {showAddPast && (
        <AddPastRentModal
          tenant={tenant}
          onClose={() => setShowAddPast(false)}
          onSuccess={() => { setShowAddPast(false); router.refresh(); }}
        />
      )}
    </div>
  );
}
