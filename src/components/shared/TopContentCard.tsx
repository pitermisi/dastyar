import React from 'react';
import { Eye, Heart, MessageCircle, Play } from 'lucide-react';
import type { InstagramMediaItem } from '../../../types/instagram-data.js';

interface TopContentCardProps {
  title: string;
  items: InstagramMediaItem[];
  metric: 'views' | 'likes' | 'comments';
  available?: boolean;
  message?: string;
}

const metricConfig = {
  views: { icon: Eye, label: 'بازدید', key: 'viewsCount' as const, color: 'text-blue-600 bg-blue-50' },
  likes: { icon: Heart, label: 'لایک', key: 'likeCount' as const, color: 'text-pink-600 bg-pink-50' },
  comments: { icon: MessageCircle, label: 'کامنت', key: 'commentsCount' as const, color: 'text-amber-600 bg-amber-50' },
};

export function TopContentCard({ title, items, metric, available = true, message }: TopContentCardProps) {
  const config = metricConfig[metric];
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${config.color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {!available || items.length === 0 ? (
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Icon className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-500">{message || 'هنوز داده‌ای برای نمایش وجود ندارد.'}</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {items.slice(0, 5).map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition">
              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                {index + 1}
              </span>
              <div className="w-11 h-11 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                {item.thumbnailUrl ? (
                  <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    {item.mediaType === 'VIDEO' || item.mediaType === 'REEL' ? (
                      <Play className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-800 font-medium truncate">
                  {item.caption?.slice(0, 60) || (item.mediaType === 'REEL' ? 'ریلز' : 'پست')}
                </p>
                {item.timestamp && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(item.timestamp).toLocaleDateString('fa-IR')}
                  </p>
                )}
              </div>
              <div className="text-left shrink-0">
                <p className="text-sm font-bold text-slate-800">
                  {(item[config.key] || 0).toLocaleString('fa-IR')}
                </p>
                <p className="text-[10px] text-slate-400">{config.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
