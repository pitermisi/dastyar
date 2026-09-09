import type { InstagramAnalyticsSummary, TopContentData } from '../../types/instagram-data.js';
import { fetchUserMedia } from './media.js';

export async function getAnalyticsSummary(
  accessToken: string,
  instagramUserId: string
): Promise<InstagramAnalyticsSummary> {
  try {
    const fields = 'followers_count,follows_count,media_count';
    const url = `https://graph.instagram.com/v21.0/${instagramUserId}?fields=${fields}&access_token=${accessToken}`;

    const response = await fetch(url);
    if (!response.ok) {
      return {
        available: false,
        message: 'این آمار پس از فعال شدن دسترسی مربوطه نمایش داده می‌شود.',
      };
    }

    const data = await response.json();
    return {
      followersCount: data.followers_count,
      followsCount: data.follows_count,
      mediaCount: data.media_count,
      available: true,
    };
  } catch {
    return {
      available: false,
      message: 'این آمار پس از فعال شدن دسترسی مربوطه نمایش داده می‌شود.',
    };
  }
}

export async function getTopContent(
  accessToken: string
): Promise<TopContentData> {
  try {
    const media = await fetchUserMedia(accessToken, 50);

    if (!media.length) {
      return {
        byViews: [],
        byLikes: [],
        byComments: [],
        available: false,
        message: 'هنوز محتوایی برای نمایش وجود ندارد.',
      };
    }

    const byViews = [...media]
      .filter((m) => m.viewsCount != null)
      .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
      .slice(0, 5);

    const byLikes = [...media]
      .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
      .slice(0, 5);

    const byComments = [...media]
      .sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0))
      .slice(0, 5);

    return {
      byViews,
      byLikes,
      byComments,
      available: true,
    };
  } catch {
    return {
      byViews: [],
      byLikes: [],
      byComments: [],
      available: false,
      message: 'خطا در دریافت اطلاعات محتوا. لطفاً دوباره تلاش کنید.',
    };
  }
}

export async function getGrowthData(
  _accessToken: string
): Promise<{ available: boolean; message: string }> {
  return {
    available: false,
    message: 'داده‌های تاریخی رشد پیج پس از فعال‌سازی دسترسی Instagram Insights API نمایش داده خواهد شد.',
  };
}
