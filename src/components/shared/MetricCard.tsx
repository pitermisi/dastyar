import React from 'react';

interface MetricCardProps {
  title: string;
  value?: string | number;
  icon: React.ReactNode;
  available?: boolean;
  message?: string;
  color?: 'purple' | 'pink' | 'blue' | 'green' | 'amber';
}

const colorMap = {
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  pink: 'bg-pink-50 text-pink-600 border-pink-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
};

export function MetricCard({ title, value, icon, available = true, message, color = 'purple' }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      {available && value !== undefined ? (
        <p className="text-2xl font-bold text-slate-900">{typeof value === 'number' ? value.toLocaleString('fa-IR') : value}</p>
      ) : (
        <p className="text-sm text-slate-400 leading-relaxed">{message || 'این آمار پس از فعال شدن دسترسی مربوطه نمایش داده می‌شود.'}</p>
      )}
    </div>
  );
}
