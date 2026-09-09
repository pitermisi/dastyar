import type { InstagramMediaItem } from '../../types/instagram-data.js';

const GRAPH_API_BASE = 'https://graph.instagram.com/v21.0';

export async function fetchUserMedia(
  accessToken: string,
  limit: number = 25
): Promise<InstagramMediaItem[]> {
  const fields = 'id,media_type,media_url,thumbnail_url,caption,timestamp,like_count,comments_count,permalink';
  const url = `${GRAPH_API_BASE}/me/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`;

  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Instagram media API error: ${response.status} - ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return (data.data || []).map((item: any) => ({
    id: item.id,
    mediaType: item.media_type || 'IMAGE',
    mediaUrl: item.media_url,
    thumbnailUrl: item.thumbnail_url || item.media_url,
    caption: item.caption,
    timestamp: item.timestamp,
    likeCount: item.like_count,
    commentsCount: item.comments_count,
    viewsCount: item.video_views_count || item.insights?.data?.find((i: any) => i.name === 'views')?.values?.[0]?.value,
    permalink: item.permalink,
  }));
}

export async function fetchMediaInsights(
  accessToken: string,
  mediaId: string
): Promise<{ views?: number; reach?: number; likes?: number; comments?: number } | null> {
  const url = `${GRAPH_API_BASE}/${mediaId}/insights?metric=impressions,reach,engagement&access_token=${accessToken}`;

  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const metrics: Record<string, number> = {};
  for (const item of data.data || []) {
    metrics[item.name] = item.values?.[0]?.value || 0;
  }

  return {
    views: metrics.impressions,
    reach: metrics.reach,
    likes: metrics.engagement,
  };
}
