'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CalendarPlus, Plus, Trash2, Loader2,
  CheckCircle, AlertCircle, Info,
} from 'lucide-react';
import { addMultiplePastRentRecords } from '../../actions/rentActions';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function buildLastNMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = 1; i <= n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() });
  }
  return months;
}

export default function AddPastRentModal({ tenant, onClose, onSuccess }) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // Each row = { year, month, amount, id }
  const [rows, setRows] = useState([
    { id: Date.now(), year: currentYear, month: currentMonth === 0 ? 11 : currentMonth - 1, amount: Number(tenant.monthlyRent) },
  ]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Quick-fill: last N months
  const quickFill = (n) => {
    const months = buildLastNMonths(n);
    setRows(
      months.map((m, i) => ({
        id: Date.now() + i,
        year: m.year,
        month: m.month,
        amount: Number(tenant.monthlyRent),
      }))
    );
  };

  const addRow = () => {
    // Default to one month before the earliest existing row
    const earliest = rows.reduce(
      (min, r) => (r.year * 12 + r.month < min.year * 12 + min.month ? r : min),
      rows[0]
    );
    let newMonth = earliest.month - 1;
    let newYear = earliest.year;
    if (newMonth < 0) { newMonth = 11; newYear--; }

    setRows([...rows, { id: Date.now(), year: newYear, month: newMonth, amount: Number(tenant.monthlyRent) }]);
  };

  const removeRow = (id) => setRows(rows.filter((r) => r.id !== id));

  const updateRow = (id, key, value) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, [key]: value } : r)));

  const handleSubmit = async () => {
    if (rows.length === 0) return;
    setLoading(true);

    // Validate: no duplicates within selection
    const keys = rows.map((r) => `${r.year}-${r.month}`);
    const hasDupe = keys.length !== new Set(keys).size;
    if (hasDupe) {
      toast.error('You have duplicate months selected');
      setLoading(false);
      return;
    }

    const payload = rows.map((r) => ({
      year: Number(r.year),
      month: Number(r.month),
      amount: Number(r.amount),
    }));

    const result = await addMultiplePastRentRecords(tenant.id, payload);

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    setResults(result);
    setLoading(false);

    if (result.added > 0) {
      onSuccess?.();
    }
  };

  // Build year options: from joining year to current year
  const joiningYear = new Date(tenant.joiningDate).getFullYear();
  const years = [];
  for (let y = currentYear; y >= joiningYear; y--) years.push(y);

  // Available months: up to and including current month
  const availableMonths = (year) => {
    if (Number(year) === currentYear) {
      return MONTH_NAMES.slice(0, currentMonth + 1);
    }
    return MONTH_NAMES;
  };

  if (results) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative glass-card w-full max-w-md p-6 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Records Added!</h3>

            <div className="grid grid-cols-2 gap-3 my-5">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                <p className="text-2xl font-bold text-emerald-400">{results.added}</p>
                <p className="text-xs text-slate-400 mt-0.5">Months Added</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                <p className="text-2xl font-bold text-amber-400">{results.skipped}</p>
                <p className="text-xs text-slate-400 mt-0.5">Already Existed</p>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="text-left mb-4 bg-surface-elevated rounded-xl p-3 space-y-1">
                {results.errors.map((e, i) => (
                  <p key={i} className="text-xs text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {e}
                  </p>
                ))}
              </div>
            )}

            <p className="text-sm text-slate-400 mb-5">
              The tenant now shows <span className="text-white font-semibold">{results.added} new overdue months</span> on their profile.
            </p>

            <button onClick={onClose} className="btn-primary w-full justify-center">
              Done
            </button>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative glass-card w-full max-w-lg p-6 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                <CalendarPlus className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Add Past Rent Due</h3>
                <p className="text-xs text-slate-400">{tenant.name} — {tenant.propertyNo}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white p-1 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-brand-500/5 border border-brand-500/15 rounded-xl mb-4 shrink-0">
            <Info className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Select the <span className="text-white font-medium">month the rent is for</span> — not when it's collected.
              E.g. select <span className="text-amber-400 font-medium">May</span> if the tenant owes May's rent
              (collected in June). Each month shows as a separate due record.
            </p>
          </div>

          {/* Quick fill buttons */}
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <span className="text-xs text-slate-500">Quick fill:</span>
            {[1, 2, 3, 4, 6].map((n) => (
              <button
                key={n}
                onClick={() => quickFill(n)}
                className="text-xs px-2.5 py-1 rounded-lg bg-surface-elevated border border-surface-border text-slate-400 hover:text-brand-300 hover:border-brand-500/30 transition-all"
              >
                Last {n} month{n > 1 ? 's' : ''}
              </button>
            ))}
          </div>

          {/* Rows */}
          <div className="overflow-y-auto flex-1 space-y-2 pr-1">
            {rows.map((row, idx) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2 bg-surface-elevated border border-surface-border rounded-xl p-3"
              >
                <span className="text-xs text-slate-600 font-mono w-5 text-center shrink-0">
                  {idx + 1}
                </span>

                {/* Year */}
                <select
                  value={row.year}
                  onChange={(e) => updateRow(row.id, 'year', Number(e.target.value))}
                  className="input-field py-2 text-xs flex-1"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>

                {/* Month */}
                <select
                  value={row.month}
                  onChange={(e) => updateRow(row.id, 'month', Number(e.target.value))}
                  className="input-field py-2 text-xs flex-1"
                >
                  {availableMonths(row.year).map((name, i) => (
                    <option key={i} value={i}>{name}</option>
                  ))}
                </select>

                {/* Amount */}
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
                  <input
                    type="number"
                    value={row.amount}
                    onChange={(e) => updateRow(row.id, 'amount', e.target.value)}
                    className="input-field py-2 text-xs pl-6"
                    min={1}
                  />
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length === 1}
                  className="w-8 h-8 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all flex items-center justify-center disabled:opacity-30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}

            {/* Add row button */}
            <button
              onClick={addRow}
              className="w-full py-2.5 rounded-xl border border-dashed border-surface-border text-slate-500 hover:text-brand-400 hover:border-brand-500/30 text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add another month
            </button>
          </div>

          {/* Footer summary + submit */}
          <div className="shrink-0 pt-4 mt-2 border-t border-surface-border">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-slate-400">
                <span className="text-white font-semibold">{rows.length}</span> month{rows.length !== 1 ? 's' : ''} selected
              </div>
              <div className="text-xs text-slate-400">
                Total:{' '}
                <span className="text-amber-400 font-semibold">
                  {formatCurrency(rows.reduce((s, r) => s + Number(r.amount || 0), 0))}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || rows.length === 0}
                className="btn-primary flex-1 justify-center"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><CalendarPlus className="w-4 h-4" /> Add {rows.length} Record{rows.length !== 1 ? 's' : ''}</>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
