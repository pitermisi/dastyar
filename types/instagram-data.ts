export interface InstagramMediaItem {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REEL';
  mediaUrl?: string;
  thumbnailUrl?: string;
  caption?: string;
  timestamp?: string;
  likeCount?: number;
  commentsCount?: number;
  viewsCount?: number;
  permalink?: string;
}

export interface InstagramInsightMetric {
  name: string;
  value: number;
  title: string;
  description?: string;
}

export interface InstagramInsightsData {
  metrics: InstagramInsightMetric[];
  period: string;
  available: boolean;
  message?: string;
}

export interface InstagramAnalyticsSummary {
  followersCount?: number;
  followsCount?: number;
  mediaCount?: number;
  reach?: number;
  impressions?: number;
  engagementRate?: number;
  available: boolean;
  message?: string;
}

export interface TopContentData {
  byViews: InstagramMediaItem[];
  byLikes: InstagramMediaItem[];
  byComments: InstagramMediaItem[];
  available: boolean;
  message?: string;
}
