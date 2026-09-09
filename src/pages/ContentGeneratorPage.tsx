import React from 'react';
import { Wand2 } from 'lucide-react';
import { ComingSoonPage } from '../components/shared/ComingSoonPage.js';

export function ContentGeneratorPage() {
  return (
    <ComingSoonPage
      icon={<Wand2 className="w-10 h-10" />}
      title="تولید محتوا"
      description="با کمک هوش مصنوعی محتوای مناسب پیج خود را تولید کنید. این قابلیت به‌زودی در دسترس خواهد بود."
    />
  );
}
