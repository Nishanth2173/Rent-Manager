'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Shield, Bell, Save, Loader2, CheckCircle } from 'lucide-react';
import { updateProfile, changePassword } from '../../actions/settingsActions';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function SettingsClient({ user }) {
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    const result = await updateProfile(new FormData(e.target));
    if (result.error) toast.error(result.error);
    else toast.success('Profile updated!');
    setProfileLoading(false);
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    const result = await changePassword(new FormData(e.target));
    if (result.error) toast.error(result.error);
    else {
      toast.success('Password changed!');
      e.target.reset();
    }
    setPasswordLoading(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-xl font-display font-bold text-white">Settings</h2>
        <p className="text-sm text-slate-400 mt-0.5">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <User className="w-4.5 h-4.5 text-brand-400" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Profile Information</h3>
            <p className="text-xs text-slate-500">Member since {formatDate(user?.createdAt)}</p>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-surface-elevated rounded-xl border border-surface-border">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-white">{user?.name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div>
            <p className="font-semibold text-white">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="text-xs bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-md font-medium mt-1 inline-block">
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input name="name" defaultValue={user?.name} className="input-field" required />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input name="phone" defaultValue={user?.phone || ''} className="input-field" placeholder="+91-9876543210" />
            </div>
          </div>
          <div>
            <label className="label">Email Address</label>
            <input value={user?.email} disabled className="input-field opacity-50 cursor-not-allowed" />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={profileLoading} className="btn-primary">
            {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Profile</>}
          </button>
        </form>
      </motion.div>

      {/* Password */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">Change Password</h3>
        </div>

        <form onSubmit={handlePassword} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input name="currentPassword" type="password" className="input-field" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">New Password</label>
              <input name="newPassword" type="password" className="input-field" minLength={8} required />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input name="confirmPassword" type="password" className="input-field" minLength={8} required />
            </div>
          </div>
          <button type="submit" disabled={passwordLoading} className="btn-primary">
            {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Shield className="w-4 h-4" /> Update Password</>}
          </button>
        </form>
      </motion.div>

      {/* App Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
            <Bell className="w-4 h-4 text-sky-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">System Info</h3>
        </div>
        <div className="space-y-3 text-sm">
          {[
            { label: 'App Version', value: 'v1.0.0' },
            { label: 'Stack', value: 'Next.js 15 + Prisma + PostgreSQL' },
            { label: 'Rent Auto-Generation', value: 'Enabled on page load' },
            { label: 'Overdue Detection', value: 'Automatic (daily)' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
              <span className="text-slate-400">{item.label}</span>
              <span className="text-slate-200 font-medium text-xs">{item.value}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
