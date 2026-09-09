import React from 'react';
import { Calendar } from 'lucide-react';
import { ComingSoonPage } from '../components/shared/ComingSoonPage.js';

export function ContentPlannerPage() {
  return (
    <ComingSoonPage
      icon={<Calendar className="w-10 h-10" />}
      title="برنامه‌ریز محتوا"
      description="برای انتشار محتوای خود برنامه‌ریزی کنید. زمان‌بندی هوشمند انتشار پست و استوری به‌زودی فعال خواهد شد."
    />
  );
}
