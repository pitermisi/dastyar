import React from 'react';
import {
  Instagram,
  BarChart3,
  MessageSquare,
  Calendar,
  Wand2,
  Type,
  TrendingUp,
  Bot,
  ArrowLeft,
  CheckCircle,
  Shield,
  Zap,
} from 'lucide-react';
import { LoginButton } from '../LoginButton.js';

interface LandingPageProps {
  isAuthenticated: boolean;
  onLoginSuccess: () => void;
  onLoginError: (msg: string) => void;
  onNavigateDashboard: () => void;
}

const features = [
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'تحلیل پیج',
    desc: 'آمار دقیق و تحلیل هوشمند عملکرد پیج اینستاگرام شما',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'مدیریت دایرکت',
    desc: 'پاسخ‌های خودکار و مدیریت هوشمند پیام‌های دایرکت',
    color: 'from-purple-500 to-violet-500',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: 'برنامه‌ریزی محتوا',
    desc: 'زمان‌بندی انتشار پست و استوری با تقویم هوشمند',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
  {
    icon: <Wand2 className="w-6 h-6" />,
    title: 'تولید محتوا',
    desc: 'ساخت محتوای جذاب با کمک هوش مصنوعی',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
  },
  {
    icon: <Type className="w-6 h-6" />,
    title: 'کپشن هوشمند',
    desc: 'تولید کپشن‌های خلاقانه و جذاب برای پست‌های شما',
    color: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
    text: 'text-pink-600',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'تکنیک‌های ترند',
    desc: 'دنبال کردن ترندها و تکنیک‌های جدید رشد در اینستاگرام',
    color: 'from-red-500 to-pink-500',
    bg: 'bg-red-50',
    text: 'text-red-600',
  },
];

export function LandingPage({ isAuthenticated, onLoginSuccess, onLoginError, onNavigateDashboard }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-sm shadow-purple-200">
              <Instagram className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-900">اینستاگرام AI</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={onNavigateDashboard}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition"
              >
                ورود به داشبورد
              </button>
            ) : (
              <button
                onClick={onNavigateDashboard}
                className="hidden sm:block px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium transition"
              >
                ورود به داشبورد
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 via-white to-white pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-purple-200/30 via-pink-200/20 to-blue-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold mb-6">
              <Zap className="w-3.5 h-3.5" />
              مدیریت حرفه‌ای اینستاگرام
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
              مدیریت هوشمند اینستاگرام
              <br />
              <span className="bg-gradient-to-l from-purple-600 to-pink-600 bg-clip-text text-transparent">
                با قدرت هوش مصنوعی
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-10">
              پیج اینستاگرام خودت را تحلیل کن، محتوایت را بهتر مدیریت کن و با یک دستیار هوشمند رشد کن.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <button
                  onClick={onNavigateDashboard}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-l from-purple-600 to-pink-600 text-white rounded-xl text-base font-bold hover:shadow-lg hover:shadow-purple-200 transition-all flex items-center justify-center gap-2"
                >
                  ورود به داشبورد
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <LoginButton
                  onSuccess={onLoginSuccess}
                  onError={onLoginError}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-l from-purple-600 to-pink-600 text-white rounded-xl text-base font-bold hover:shadow-lg hover:shadow-purple-200 transition-all"
                  label="اتصال به اینستاگرام"
                />
              )}
            </div>

            <div className="flex items-center justify-center gap-6 mt-8 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                رمزنگاری AES-256
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                API رسمی Meta
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">امکانات کلیدی</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">ابزارهای حرفه‌ای برای مدیریت و رشد پیج اینستاگرام شما</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200/80 p-6 hover:shadow-md hover:border-slate-300 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} ${f.text} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-2xl p-8 sm:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-pink-400/20 rounded-full translate-x-1/3 translate-y-1/3 blur-2xl" />

            <div className="relative flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 text-center lg:text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-4">
                  <Bot className="w-3.5 h-3.5" />
                  هوش مصنوعی
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">دستیار هوشمند پیج شما</h2>
                <p className="text-purple-100 text-base leading-relaxed max-w-lg">
                  هوش مصنوعی عملکرد پیج شما را بررسی می‌کند و برای رشد بهتر، پیشنهادهای کاربردی ارائه می‌دهد.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-6">
                  {['تحلیل عملکرد', 'پیشنهاد محتوا', 'بهینه‌سازی زمان انتشار'].map((tag) => (
                    <span key={tag} className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0">
                <Bot className="w-20 h-20 sm:w-24 sm:h-24 text-white/80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">پنل مدیریت حرفه‌ای</h2>
            <p className="text-slate-500 text-sm">یک داشبورد کامل برای مدیریت تمام بخش‌های پیج شما</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden">
            <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center gap-2 px-4">
              <div className="w-3 h-3 rounded-full bg-red-300" />
              <div className="w-3 h-3 rounded-full bg-amber-300" />
              <div className="w-3 h-3 rounded-full bg-emerald-300" />
              <span className="text-xs text-slate-400 mr-4 font-mono">dashboard</span>
            </div>
            <div className="p-6 sm:p-8 flex gap-6 min-h-[300px]">
              {/* Mock sidebar */}
              <div className="hidden sm:block w-40 space-y-2 shrink-0">
                {['داشبورد', 'دایرکت', 'برنامه‌ریز', 'آنالیز'].map((item, i) => (
                  <div key={item} className={`px-3 py-2 rounded-lg text-xs font-medium ${i === 0 ? 'bg-purple-50 text-purple-700' : 'text-slate-400'}`}>
                    {item}
                  </div>
                ))}
              </div>
              {/* Mock content */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[{ l: 'فالوور', v: '۱۲,۳۴۵' }, { l: 'بازدید', v: '۵۶,۷۸۹' }, { l: 'تعامل', v: '٪۴.۲' }].map((m) => (
                    <div key={m.l} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                      <p className="text-[10px] text-slate-400 mb-1">{m.l}</p>
                      <p className="text-lg font-bold text-slate-700">{m.v}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 rounded-lg h-32 border border-slate-100 flex items-center justify-center">
                  <p className="text-xs text-slate-300">نمودار رشد</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">شروع کنید</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">همین الان پیج اینستاگرام خود را متصل کنید و از امکانات هوشمند بهره‌مند شوید.</p>
          {isAuthenticated ? (
            <button
              onClick={onNavigateDashboard}
              className="px-8 py-3.5 bg-gradient-to-l from-purple-600 to-pink-600 text-white rounded-xl text-base font-bold hover:shadow-lg hover:shadow-purple-200 transition-all"
            >
              ورود به داشبورد
            </button>
          ) : (
            <LoginButton
              onSuccess={onLoginSuccess}
              onError={onLoginError}
              className="px-8 py-3.5 bg-gradient-to-l from-purple-600 to-pink-600 text-white rounded-xl text-base font-bold hover:shadow-lg hover:shadow-purple-200 transition-all"
              label="اتصال به اینستاگرام"
            />
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50/50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Instagram className="w-4 h-4 text-pink-400" />
            <span>© {new Date().getFullYear()} اینستاگرام AI. تمامی حقوق محفوظ است.</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-slate-600 transition">حریم خصوصی</a>
            <a href="/terms" className="hover:text-slate-600 transition">شرایط استفاده</a>
            <a href="/data-deletion" className="hover:text-slate-600 transition">حذف اطلاعات</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
