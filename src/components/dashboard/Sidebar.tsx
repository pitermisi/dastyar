import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Wand2,
  BarChart3,
  Type,
  TrendingUp,
  Settings,
  LogOut,
  X,
  Instagram,
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  navigate: (path: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/dashboard', label: 'داشبورد', icon: LayoutDashboard, active: true },
  { path: '/dashboard/automation', label: 'دایرکت اتوماتیک', icon: MessageSquare, active: true },
  { path: '/dashboard/content-planner', label: 'برنامه‌ریز محتوا', icon: Calendar, active: false },
  { path: '/dashboard/content-generator', label: 'تولید محتوا', icon: Wand2, active: false },
  { path: '/dashboard/analytics', label: 'آنالیز پیج', icon: BarChart3, active: false },
  { path: '/dashboard/captions', label: 'کپشن', icon: Type, active: false },
  { path: '/dashboard/trends', label: 'تکنیک‌های ترند', icon: TrendingUp, active: false },
];

export function Sidebar({ currentPath, navigate, onLogout, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-64 bg-white border-l border-slate-200 z-50
          transform transition-transform duration-200 ease-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white">
              <Instagram className="w-4.5 h-4.5" />
            </div>
            <span className="font-bold text-slate-900 text-sm">اینستاگرام AI</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => {
                  if (item.active) {
                    navigate(item.path);
                    onClose();
                  }
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-purple-50 text-purple-700 border border-purple-100'
                    : item.active
                      ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      : 'text-slate-400 cursor-default'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : ''}`} />
                <span className="flex-1 text-right">{item.label}</span>
                {!item.active && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded-full font-normal">
                    به‌زودی
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-slate-100 px-3 py-3 space-y-1">
          <button
            onClick={() => {
              navigate('/dashboard/settings');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
          >
            <Settings className="w-5 h-5" />
            <span className="flex-1 text-right">تنظیمات</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="flex-1 text-right">خروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}
