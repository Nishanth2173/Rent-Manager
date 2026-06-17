'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Building2, User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { registerUser } from '../../actions/authActions';
import toast from 'react-hot-toast';

export default function SetupClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    const result = await registerUser(fd);

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    setDone(true);
    toast.success('Account created! Signing you in...');

    // Auto sign-in after registration
    await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 mb-4"
            style={{ boxShadow: '0 0 40px rgba(99,102,241,0.5)' }}
          >
            <Building2 className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-white">
            Rent<span className="gradient-text">Flow</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Property management made simple</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-2 text-xs font-medium text-brand-400">
              <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center text-white text-[10px] font-bold">1</div>
              Create Account
            </div>
            <div className="flex-1 h-px bg-surface-border" />
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <div className="w-5 h-5 rounded-full bg-surface-elevated border border-surface-border flex items-center justify-center text-slate-600 text-[10px] font-bold">2</div>
              Start Managing
            </div>
          </div>

          <h2 className="text-lg font-semibold text-white mb-1">Welcome! Set up your account</h2>
          <p className="text-slate-400 text-sm mb-6">This is a first-time setup. Create your landlord account to get started.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="label">Your Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  className="input-field pl-10"
                  placeholder="Rajesh Kumar"
                  required
                  minLength={2}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  className="input-field pl-10 pr-10"
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  className="input-field pl-10 pr-10"
                  placeholder="Re-enter password"
                  required
                  minLength={8}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password match indicator */}
              {form.confirmPassword && (
                <p className={`text-xs mt-1.5 flex items-center gap-1 ${form.password === form.confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                  {form.password === form.confirmPassword ? (
                    <><CheckCircle className="w-3 h-3" /> Passwords match</>
                  ) : (
                    <>✗ Passwords do not match</>
                  )}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || done}
              className="btn-primary w-full justify-center py-3 text-base mt-2"
            >
              {loading || done ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Create Account & Continue <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-5">
            Already have an account?{' '}
            <a href="/login" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
              Sign in
            </a>
          </p>
        </div>

        {/* Info box */}
        <div className="mt-4 p-4 bg-surface-card border border-surface-border rounded-xl">
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="text-slate-300 font-medium">No seed data needed.</span> This setup page is only shown once — it automatically redirects to login after an account is created.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
