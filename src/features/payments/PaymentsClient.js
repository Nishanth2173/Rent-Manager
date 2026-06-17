'use client';

import { useState, useTransition, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CreditCard, ChevronLeft, ChevronRight, CheckCircle, Calendar } from 'lucide-react';
import { getRentRecords } from '../../actions/paymentActions';
import { formatCurrency, formatDate, formatMonthYear } from '../../utils/helpers';
import StatusBadge from '../../components/ui/StatusBadge';
import PayRentModal from '../../components/shared/PayRentModal';

export default function PaymentsClient({ initialData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [payRecord, setPayRecord] = useState(null);

  const fetchRecords = useCallback(async (params) => {
    startTransition(async () => {
      const result = await getRentRecords(params);
      setData(result);
    });
  }, []);

  const handleStatusFilter = (s) => {
    setStatusFilter(s);
    setPage(1);
    fetchRecords({ status: s, page: 1 });
  };

  const handlePageChange = (p) => {
    setPage(p);
    fetchRecords({ status: statusFilter, page: p });
  };

  const records = data?.records || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white">Rent Records</h2>
          <p className="text-sm text-slate-400 mt-0.5">{total} total records</p>
        </div>
        <div className="flex gap-2 sm:ml-auto flex-wrap">
          {[
            { value: '', label: 'All' },
            { value: 'PENDING', label: 'PENDING' },
            { value: 'PAID', label: 'PAID' },
            { value: 'OVERDUE', label: 'OVERDUE' },
          ].map(({ value, label }) => (
            <button
              key={`status-${value || 'all'}`}
              onClick={() => handleStatusFilter(value)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                statusFilter === value
                  ? 'bg-brand-600/20 border-brand-500/40 text-brand-300'
                  : 'bg-surface-elevated border-surface-border text-slate-400 hover:text-white'
              }`}
              suppressHydrationWarning
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {isPending && <div className="h-0.5 bg-brand-600 animate-pulse" />}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="table-header text-left px-5 py-4">Tenant</th>
                <th className="table-header text-left px-4 py-4 hidden sm:table-cell">Month</th>
                <th className="table-header text-left px-4 py-4 hidden md:table-cell">Due Date</th>
                <th className="table-header text-left px-4 py-4">Amount</th>
                <th className="table-header text-left px-4 py-4">Status</th>
                <th className="table-header text-left px-4 py-4 hidden lg:table-cell">Paid On</th>
                <th className="table-header text-right px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No records found</p>
                  </td>
                </tr>
              ) : (
                records.map((record, i) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-surface-elevated/30 transition-colors"
                  >
                    <td className="table-cell px-5">
                      <div>
                        <p className="font-medium text-white text-sm">{record.tenant.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{record.tenant.propertyNo}</p>
                      </div>
                    </td>
                    <td className="table-cell px-4 hidden sm:table-cell">
                      <p className="text-slate-300 text-sm">Rent for {formatMonthYear(record.rentMonth)}</p>
                      <p className="text-xs text-slate-500">Collect by {formatDate(record.dueDate)}</p>
                    </td>
                    <td className="table-cell px-4 hidden md:table-cell text-slate-400 text-xs">
                      {formatDate(record.dueDate)}
                    </td>
                    <td className="table-cell px-4">
                      <span className="font-semibold text-white">{formatCurrency(record.amount)}</span>
                    </td>
                    <td className="table-cell px-4">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="table-cell px-4 hidden lg:table-cell text-slate-400 text-xs">
                      {record.paidAt ? formatDate(record.paidAt) : '—'}
                    </td>
                    <td className="table-cell px-5 text-right">
                      {record.status !== 'PAID' ? (
                        <button
                          onClick={() => setPayRecord(record)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Mark Paid
                        </button>
                      ) : (
                        <span className="text-xs text-slate-600">Completed</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="px-5 py-4 border-t border-surface-border flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}
                className="w-8 h-8 rounded-lg bg-surface-elevated border border-surface-border text-slate-400 hover:text-white disabled:opacity-40 flex items-center justify-center">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => handlePageChange(page + 1)} disabled={page === pages}
                className="w-8 h-8 rounded-lg bg-surface-elevated border border-surface-border text-slate-400 hover:text-white disabled:opacity-40 flex items-center justify-center">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {payRecord && (
        <PayRentModal
          record={payRecord}
          onClose={() => setPayRecord(null)}
          onSuccess={() => {
            setPayRecord(null);
            fetchRecords({ status: statusFilter, page });
          }}
        />
      )}
    </div>
  );
}
