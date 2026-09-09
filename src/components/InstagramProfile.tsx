import React from 'react';
import { CheckCircle2, User, ShieldCheck, Hash, Tag, Calendar } from 'lucide-react';
import type { InstagramProfileData } from '../types/instagram.js';
import { LogoutButton } from './LogoutButton.js';

interface InstagramProfileProps {
  profile: InstagramProfileData;
  onLogoutSuccess?: () => void;
}

export const InstagramProfile: React.FC<InstagramProfileProps> = ({
  profile,
  onLogoutSuccess,
}) => {
  return (
    <div id="card-instagram-profile" className="w-full max-w-xl mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header status bar */}
      <div className="bg-emerald-50/80 border-b border-emerald-100/80 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-800 font-medium text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Instagram Connected</span>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          Active Session
        </span>
      </div>

      <div className="p-6 sm:p-8">
        {/* Profile Card Main Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100 text-center sm:text-left">
          {profile.profilePictureUrl ? (
            <img
              id="img-instagram-avatar"
              src={profile.profilePictureUrl}
              alt={profile.username}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-full object-cover border-2 border-pink-500/20 shadow-sm"
              onError={(e) => {
                // Fallback to placeholder if profile picture URL expires or fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div
              id="placeholder-instagram-avatar"
              className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-100 to-pink-100 flex items-center justify-center border-2 border-pink-500/20 text-pink-600 font-bold text-2xl shadow-sm"
            >
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 id="text-instagram-username" className="text-2xl font-bold text-slate-900 truncate">
              @{profile.username}
            </h2>
            {profile.name && (
              <p id="text-instagram-name" className="text-base text-slate-600 mt-0.5">
                {profile.name}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                OAuth Verified
              </span>
              {profile.accountType && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                  <Tag className="w-3.5 h-3.5 text-purple-500" />
                  {profile.accountType}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Account Details List */}
        <div className="py-5 space-y-3.5">
          <div className="flex items-center justify-between text-sm py-1">
            <span className="text-slate-500 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              Display Name
            </span>
            <span className="font-medium text-slate-900">{profile.name || 'Not provided'}</span>
          </div>

          <div className="flex items-center justify-between text-sm py-1">
            <span className="text-slate-500 flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400" />
              Account Type
            </span>
            <span className="font-medium text-slate-900">
              {profile.accountType || 'Standard (Business/Creator)'}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm py-1">
            <span className="text-slate-500 flex items-center gap-2">
              <Hash className="w-4 h-4 text-slate-400" />
              Instagram ID
            </span>
            <span className="font-mono text-xs font-medium bg-slate-100 text-slate-800 px-2 py-1 rounded">
              {profile.instagramUserId}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm py-1">
            <span className="text-slate-500 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Connected On
            </span>
            <span className="text-slate-600 text-xs">
              {new Date(profile.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">Tokens stored securely server-side</span>
          <LogoutButton onLogoutSuccess={onLogoutSuccess} />
        </div>
      </div>
    </div>
  );
};
