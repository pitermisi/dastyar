import React from 'react';
import { BarChart3 } from 'lucide-react';
import { ComingSoonPage } from '../components/shared/ComingSoonPage.js';

export function AnalyticsPage() {
  return (
    <ComingSoonPage
      icon={<BarChart3 className="w-10 h-10" />}
      title="آنالیز هوشمند پیج"
      description="هوش مصنوعی عملکرد پیج شما را بررسی می‌کند و گزارش‌های تحلیلی ارائه می‌دهد. به‌زودی..."
    />
  );
}
