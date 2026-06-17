'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, UserPlus, Save } from 'lucide-react';
import Link from 'next/link';
import { createTenant, updateTenant } from '../../actions/tenantActions';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function TenantForm({ tenant = null }) {
  const router = useRouter();
  const isEdit = !!tenant;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const result = isEdit
      ? await updateTenant(tenant.id, formData)
      : await createTenant(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      toast.success(isEdit ? 'Tenant updated!' : 'Tenant added successfully!');
      router.push(isEdit ? `/tenants/${tenant.id}` : '/tenants');
    }
  };

  const defaultDate = tenant?.joiningDate
    ? new Date(tenant.joiningDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/tenants">
          <button className="w-9 h-9 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h2 className="text-xl font-display font-bold text-white">
            {isEdit ? 'Edit Tenant' : 'Add New Tenant'}
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {isEdit ? `Editing ${tenant.name}` : 'Register a new tenant in your property'}
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-brand-600/30 flex items-center justify-center text-brand-400 text-xs font-bold">1</span>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  name="name"
                  defaultValue={tenant?.name}
                  className="input-field"
                  placeholder="Arjun Sharma"
                  required
                />
              </div>
              <div>
                <label className="label">Mobile Number *</label>
                <input
                  name="mobile"
                  defaultValue={tenant?.mobile}
                  className="input-field"
                  placeholder="9876543210"
                  pattern="\d{10}"
                  title="Enter 10-digit mobile number"
                  required
                />
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Property Info */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-brand-600/30 flex items-center justify-center text-brand-400 text-xs font-bold">2</span>
              Property Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Property / Room Number *</label>
                <input
                  name="propertyNo"
                  defaultValue={tenant?.propertyNo}
                  className="input-field"
                  placeholder="A-101"
                  required
                />
              </div>
              <div>
                <label className="label">Joining Date *</label>
                <input
                  name="joiningDate"
                  type="date"
                  defaultValue={defaultDate}
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Rent Info */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-brand-600/30 flex items-center justify-center text-brand-400 text-xs font-bold">3</span>
              Rent Configuration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Monthly Rent (₹) *</label>
                <input
                  name="monthlyRent"
                  type="number"
                  defaultValue={tenant?.monthlyRent}
                  className="input-field"
                  placeholder="10000"
                  min={100}
                  required
                />
              </div>
              <div>
                <label className="label">Collection Day (1–31) *</label>
                <input
                  name="rentDueDay"
                  type="number"
                  defaultValue={tenant?.rentDueDay || 5}
                  className="input-field"
                  min={1}
                  max={31}
                  required
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Day of <span className="text-amber-400 font-medium">next month</span> when rent is collected.
                  e.g. May rent → collected on this day in June.
                </p>
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Status & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select name="status" defaultValue={tenant?.status || 'ACTIVE'} className="input-field">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div>
              <label className="label">Notes (Optional)</label>
              <input
                name="notes"
                defaultValue={tenant?.notes || ''}
                className="input-field"
                placeholder="Any additional notes"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Link href="/tenants" className="btn-secondary flex-1 justify-center">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEdit ? (
                <><Save className="w-4 h-4" /> Save Changes</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Add Tenant</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
