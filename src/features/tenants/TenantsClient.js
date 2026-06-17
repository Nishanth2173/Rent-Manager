'use client';

import { useState, useTransition, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, Filter, UserCheck, Phone, Home,
  IndianRupee, Trash2, Edit, Eye, ChevronLeft, ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { deleteTenant, getTenants } from '../../actions/tenantActions';
import { formatCurrency, formatDate, getOrdinal } from '../../utils/helpers';
import StatusBadge from '../../components/ui/StatusBadge';
import toast from 'react-hot-toast';

export default function TenantsClient({ initialData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const fetchTenants = useCallback(async (params) => {
    startTransition(async () => {
      const result = await getTenants(params);
      setData(result);
    });
  }, []);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
    fetchTenants({ search: val, status: statusFilter, page: 1 });
  };

  const handleStatusFilter = (val) => {
    setStatusFilter(val);
    setPage(1);
    fetchTenants({ search, status: val, page: 1 });
  };

  const handlePageChange = (p) => {
    setPage(p);
    fetchTenants({ search, status: statusFilter, page: p });
  };

  const handleDelete = async (id) => {
    const result = await deleteTenant(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Tenant deleted');
      fetchTenants({ search, status: statusFilter, page });
    }
    setDeleteId(null);
  };

  const tenants = data?.tenants || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white">All Tenants</h2>
          <p className="text-sm text-slate-400 mt-0.5">{total} tenant{total !== 1 ? 's' : ''} registered</p>
        </div>
        <Link href="/tenants/add" className="btn-primary sm:ml-auto">
          <Plus className="w-4 h-4" />
          Add Tenant
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, mobile, or property..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: '', label: 'All' },
            { value: 'ACTIVE', label: 'ACTIVE' },
            { value: 'INACTIVE', label: 'INACTIVE' },
          ].map(({ value, label }) => (
            <button
              key={`status-${value || 'all'}`}
              onClick={() => handleStatusFilter(value)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
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

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {isPending && (
          <div className="h-1 bg-brand-600 animate-pulse" />
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="table-header text-left px-5 py-4">Tenant</th>
                <th className="table-header text-left px-4 py-4 hidden sm:table-cell">Property</th>
                <th className="table-header text-left px-4 py-4 hidden md:table-cell">Monthly Rent</th>
                <th className="table-header text-left px-4 py-4 hidden lg:table-cell">Due Day</th>
                <th className="table-header text-left px-4 py-4">Pending</th>
                <th className="table-header text-left px-4 py-4">Status</th>
                <th className="table-header text-right px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              <AnimatePresence mode="popLayout">
                {tenants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-slate-500">
                      <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No tenants found</p>
                      <Link href="/tenants/add" className="text-brand-400 text-sm hover:underline mt-1 inline-block">Add your first tenant →</Link>
                    </td>
                  </tr>
                ) : (
                  tenants.map((tenant, i) => {
                    const unpaidRecords = tenant.rentRecords || [];
                    const totalDue = unpaidRecords.reduce((s, r) => s + Number(r.amount), 0);
                    const monthsDue = unpaidRecords.length;

                    return (
                      <motion.tr
                        key={tenant.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-surface-elevated/30 transition-colors"
                      >
                        <td className="table-cell px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-white">{tenant.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium text-white text-sm">{tenant.name}</p>
                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {tenant.mobile}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell px-4 hidden sm:table-cell">
                          <span className="inline-flex items-center gap-1.5 text-xs bg-surface-elevated border border-surface-border px-2.5 py-1 rounded-lg font-mono text-slate-300">
                            <Home className="w-3 h-3" /> {tenant.propertyNo}
                          </span>
                        </td>
                        <td className="table-cell px-4 hidden md:table-cell">
                          <span className="text-white font-semibold text-sm">{formatCurrency(tenant.monthlyRent)}</span>
                        </td>
                        <td className="table-cell px-4 hidden lg:table-cell text-slate-400 text-xs">
                          {getOrdinal(tenant.rentDueDay)} of month
                        </td>
                        <td className="table-cell px-4">
                          {monthsDue === 0 ? (
                            <span className="text-emerald-400 text-xs font-medium">Clear ✓</span>
                          ) : (
                            <div>
                              <p className="text-sm font-semibold text-amber-400">{formatCurrency(totalDue)}</p>
                              <p className="text-xs text-slate-500">{monthsDue} month{monthsDue !== 1 ? 's' : ''}</p>
                            </div>
                          )}
                        </td>
                        <td className="table-cell px-4">
                          <StatusBadge status={tenant.status} />
                        </td>
                        <td className="table-cell px-5 text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <Link href={`/tenants/${tenant.id}`}>
                              <button className="w-8 h-8 rounded-lg hover:bg-surface-elevated text-slate-400 hover:text-brand-400 transition-colors flex items-center justify-center">
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                            <Link href={`/tenants/${tenant.id}/edit`}>
                              <button className="w-8 h-8 rounded-lg hover:bg-surface-elevated text-slate-400 hover:text-amber-400 transition-colors flex items-center justify-center">
                                <Edit className="w-4 h-4" />
                              </button>
                            </Link>
                            <button
                              onClick={() => setDeleteId(tenant.id)}
                              className="w-8 h-8 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-5 py-4 border-t border-surface-border flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg bg-surface-elevated border border-surface-border text-slate-400 hover:text-white disabled:opacity-40 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    p === page
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-elevated border border-surface-border text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pages}
                className="w-8 h-8 rounded-lg bg-surface-elevated border border-surface-border text-slate-400 hover:text-white disabled:opacity-40 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70"
              onClick={() => setDeleteId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative glass-card p-6 w-full max-w-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="font-semibold text-white">Delete Tenant?</h3>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                This will permanently delete the tenant and all their rent records. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
