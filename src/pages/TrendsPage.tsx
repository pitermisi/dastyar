import React from 'react';
import { TrendingUp } from 'lucide-react';
import { ComingSoonPage } from '../components/shared/ComingSoonPage.js';

export function TrendsPage() {
  return (
    <ComingSoonPage
      icon={<TrendingUp className="w-10 h-10" />}
      title="تکنیک‌های ترند"
      description="ترندها و تکنیک‌های جدید رشد در اینستاگرام را دنبال کنید. این بخش به‌زودی فعال خواهد شد."
    />
  );
}
