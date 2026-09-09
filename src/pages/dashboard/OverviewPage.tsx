import React, { useEffect, useState } from 'react';
import { Users, Eye, Heart, TrendingUp, CheckCircle, Image, Play, AlertCircle } from 'lucide-react';
import { MetricCard } from '../../components/shared/MetricCard.js';
import { GrowthChart } from '../../components/shared/GrowthChart.js';
import { TopContentCard } from '../../components/shared/TopContentCard.js';
import type { InstagramProfileData } from '../../../types/instagram.js';
import type { InstagramAnalyticsSummary, TopContentData, InstagramMediaItem } from '../../../types/instagram-data.js';

interface OverviewPageProps {
  profile: InstagramProfileData;
}

export function OverviewPage({ profile }: OverviewPageProps) {
  const [analytics, setAnalytics] = useState<InstagramAnalyticsSummary | null>(null);
  const [topContent, setTopContent] = useState<TopContentData | null>(null);
  const [growthData, setGrowthData] = useState<{ available: boolean; message?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [analyticsRes, topContentRes, growthRes] = await Promise.all([
          fetch('/api/instagram/analytics').then(r => r.json()).catch(() => ({ summary: null })),
          fetch('/api/instagram/top-content').then(r => r.json()).catch(() => ({ topContent: null })),
          fetch('/api/instagram/growth').then(r => r.json()).catch(() => ({ growth: null })),
        ]);
        setAnalytics(analyticsRes.summary);
        setTopContent(topContentRes.topContent);
        setGrowthData(growthRes.growth);
      } catch {
        // Errors handled by null states
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {profile.profilePictureUrl ? (
            <img
              src={profile.profilePictureUrl}
              alt={profile.username}
              className="w-16 h-16 rounded-xl object-cover border-2 border-slate-100"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-slate-900">@{profile.username}</h2>
              <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <CheckCircle className="w-3 h-3" />
                <span>متصل</span>
              </div>
            </div>
            {profile.name && <p className="text-sm text-slate-600">{profile.name}</p>}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
              {profile.accountType && (
                <span className="px-2 py-0.5 bg-slate-100 rounded-md">{profile.accountType}</span>
              )}
              <span>شناسه: {profile.instagramUserId}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 shrink-0">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>اتصال به اینستاگرام برقرار است</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="فالوورها"
          value={analytics?.followersCount}
          icon={<Users className="w-5 h-5" />}
          available={analytics?.available ?? false}
          message={analytics?.message}
          color="purple"
        />
        <MetricCard
          title="بازدید"
          value={analytics?.reach}
          icon={<Eye className="w-5 h-5" />}
          available={false}
          message="این آمار پس از فعال شدن دسترسی Insights نمایش داده می‌شود."
          color="blue"
        />
        <MetricCard
          title="تعامل"
          value={analytics?.engagementRate ? `${analytics.engagementRate}%` : undefined}
          icon={<Heart className="w-5 h-5" />}
          available={false}
          message="این آمار پس از فعال شدن دسترسی Insights نمایش داده می‌شود."
          color="pink"
        />
        <MetricCard
          title="محتوا"
          value={analytics?.mediaCount}
          icon={<Image className="w-5 h-5" />}
          available={analytics?.available ?? false}
          message={analytics?.message}
          color="green"
        />
      </div>

      {/* Growth Chart */}
      <GrowthChart
        available={growthData?.available ?? false}
        message={growthData?.message}
      />

      {/* Top Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TopContentCard
          title="بیشترین بازدید"
          items={topContent?.byViews || []}
          metric="views"
          available={topContent?.available ?? false}
          message={topContent?.message}
        />
        <TopContentCard
          title="بیشترین لایک"
          items={topContent?.byLikes || []}
          metric="likes"
          available={topContent?.available ?? false}
          message={topContent?.message}
        />
        <TopContentCard
          title="بیشترین کامنت"
          items={topContent?.byComments || []}
          metric="comments"
          available={topContent?.available ?? false}
          message={topContent?.message}
        />
      </div>

      {/* Meta API Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">توجه درباره دسترسی API</p>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            برخی از آمار و اطلاعات نیاز به دسترسی‌های پیشرفته‌تر از Meta API دارند. این آمار پس از فعال‌سازی دسترسی‌های مربوطه در دسترس قرار خواهند گرفت.
          </p>
        </div>
      </div>
    </div>
  );
}
