import React from 'react';
import { Type } from 'lucide-react';
import { ComingSoonPage } from '../components/shared/ComingSoonPage.js';

export function CaptionsPage() {
  return (
    <ComingSoonPage
      icon={<Type className="w-10 h-10" />}
      title="کپشن هوشمند"
      description="برای پست‌های خود کپشن‌های جذاب تولید کنید. هوش مصنوعی بهترین کپشن را برای محتوای شما می‌نویسد."
    />
  );
}
