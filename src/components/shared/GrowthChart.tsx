import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface GrowthChartProps {
  available: boolean;
  message?: string;
}

type MetricTab = 'followers' | 'reach' | 'engagement';

const tabs: { key: MetricTab; label: string }[] = [
  { key: 'followers', label: 'فالوورها' },
  { key: 'reach', label: 'بازدید' },
  { key: 'engagement', label: 'تعامل' },
];

export function GrowthChart({ available, message }: GrowthChartProps) {
  const [activeTab, setActiveTab] = useState<MetricTab>('followers');

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-slate-800 text-sm">روند رشد پیج</h3>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {!available ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-400 mx-auto mb-4">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h4 className="text-sm font-semibold text-slate-700 mb-1">داده‌ای برای نمایش وجود ندارد</h4>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            {message || 'نمودار رشد پیج پس از فعال‌سازی دسترسی Instagram Insights API نمایش داده خواهد شد.'}
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2.5 max-w-xs mx-auto">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>در انتظار فعال‌سازی دسترسی Meta</span>
          </div>
        </div>
      ) : (
        <div className="p-5 h-64 flex items-center justify-center">
          <p className="text-sm text-slate-400">نمودار رشد در اینجا نمایش داده خواهد شد.</p>
        </div>
      )}
    </div>
  );
}
