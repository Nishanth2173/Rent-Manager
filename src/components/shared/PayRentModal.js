'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, CreditCard, Loader2 } from 'lucide-react';
import { markAsPaid } from '../../actions/paymentActions';
import { formatCurrency, formatMonthYear } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function PayRentModal({ record, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: Number(record.amount),
    method: 'CASH',
    reference: '',
    notes: '',
  });

  const methods = ['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await markAsPaid(record.id, form);

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success('Payment recorded successfully!');
      onSuccess?.();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative glass-card w-full max-w-md p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Record Payment</h3>
                <p className="text-xs text-slate-400">{record.tenant?.name} — {formatMonthYear(record.rentMonth)}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Amount (₹)</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                className="input-field"
                min={1}
                required
              />
            </div>

            <div>
              <label className="label">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {methods.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setForm({ ...form, method: m })}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                      form.method === m
                        ? 'bg-brand-600/20 border-brand-500/40 text-brand-300'
                        : 'bg-surface-elevated border-surface-border text-slate-400 hover:text-white'
                    }`}
                  >
                    {m.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Reference / Transaction ID</label>
              <input
                type="text"
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                className="input-field"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="label">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input-field resize-none"
                rows={2}
                placeholder="Optional"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <><CheckCircle className="w-4 h-4" /> Mark Paid</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
