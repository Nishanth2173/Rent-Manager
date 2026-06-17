'use client';

import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { formatCurrency, formatMonthYear } from '../../utils/helpers';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-elevated border border-surface-border rounded-xl p-3 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color }}>
          {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export function CollectionAreaChart({ data }) {
  const chartData = data.map((d) => ({
    month: new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(new Date(d.month)),
    collected: d.collected,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <defs>
          <linearGradient id="collectGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="collected" stroke="#6366f1" strokeWidth={2} fill="url(#collectGrad)" name="Collected" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function StatusDonutChart({ paid, pending, overdue }) {
  const data = [
    { name: 'Paid', value: paid, color: '#34d399' },
    { name: 'Pending', value: pending, color: '#fbbf24' },
    { name: 'Overdue', value: overdue, color: '#f87171' },
  ].filter((d) => d.value > 0);

  const total = paid + pending + overdue;

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={65}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-3 flex-1">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
              <span className="text-xs text-slate-400">{d.name}</span>
            </div>
            <span className="text-xs font-semibold text-white">{total > 0 ? Math.round((d.value / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
