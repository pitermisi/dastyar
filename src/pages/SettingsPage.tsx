import React from 'react';
import { Settings, Shield, Key, Bell, Database } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-600" />
          تنظیمات
        </h1>
        <p className="text-sm text-slate-500 mt-1">مدیریت تنظیمات حساب و اپلیکیشن</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: Key, title: 'اتصال اینستاگرام', desc: 'مدیریت اتصال و توکن دسترسی', status: 'متصل', color: 'emerald' },
          { icon: Shield, title: 'امنیت', desc: 'تنظیمات امنیتی و رمزنگاری', status: 'فعال', color: 'emerald' },
          { icon: Bell, title: 'اعلان‌ها', desc: 'تنظیمات اعلان‌ها و هشدارها', status: 'به‌زودی', color: 'amber' },
          { icon: Database, title: 'پایگاه داده', desc: 'وضعیت اتصال و ذخیره‌سازی', status: 'فعال', color: 'emerald' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 text-sm">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  item.color === 'emerald'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
