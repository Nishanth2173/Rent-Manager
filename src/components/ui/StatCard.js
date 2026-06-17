'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/helpers';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'brand', delay = 0 }) {
  const colorMap = {
    brand: { bg: 'bg-brand-500/10', text: 'text-brand-400', border: 'border-brand-500/20', glow: 'rgba(99,102,241,0.2)' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'rgba(52,211,153,0.2)' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', glow: 'rgba(251,191,36,0.2)' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', glow: 'rgba(248,113,113,0.2)' },
    sky: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20', glow: 'rgba(56,189,248,0.2)' },
  };

  const c = colorMap[color] || colorMap.brand;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className="glass-card p-6 hover:border-brand-500/30 transition-colors duration-300"
      style={{ boxShadow: `0 4px 24px ${c.glow}` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', c.bg, c.border)}>
          <Icon className={cn('w-5 h-5', c.text)} />
        </div>
        {trend !== undefined && (
          <div className={cn('flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg',
            trend >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
          )}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trendValue || trend)}%
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-display font-bold text-white leading-none mb-1">{value}</p>
        <p className="text-sm font-medium text-slate-300 mt-2">{title}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
