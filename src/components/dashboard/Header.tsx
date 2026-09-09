import React from 'react';
import { Menu, Instagram, CheckCircle } from 'lucide-react';
import type { InstagramProfileData } from '../../../types/instagram.js';

interface HeaderProps {
  profile?: InstagramProfileData;
  onMenuClick: () => void;
  navigate: (path: string) => void;
}

export function Header({ profile, onMenuClick, navigate }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -mr-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
          <Instagram className="w-4 h-4 text-pink-500" />
          <span>داشبورد مدیریت اینستاگرام</span>
        </div>
      </div>

      {profile && (
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition"
        >
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-800">@{profile.username}</p>
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle className="w-3 h-3" />
              <span>متصل</span>
            </div>
          </div>
          {profile.profilePictureUrl ? (
            <img
              src={profile.profilePictureUrl}
              alt={profile.username}
              className="w-9 h-9 rounded-full object-cover border-2 border-slate-100"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
        </button>
      )}
    </header>
  );
}
