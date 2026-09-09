import React from 'react';
import { Clock } from 'lucide-react';

interface ComingSoonPageProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function ComingSoonPage({ icon, title, description }: ComingSoonPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center text-purple-500 mb-6 border border-purple-100">
        {icon}
      </div>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold mb-4">
        <Clock className="w-3.5 h-3.5" />
        به‌زودی
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed">{description}</p>
      <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
        <span className="w-2 h-2 rounded-full bg-purple-300 animate-pulse" />
        <span>این قابلیت در حال توسعه است</span>
      </div>
    </div>
  );
}
