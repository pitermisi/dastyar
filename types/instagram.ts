/**
 * Raw response from Instagram Graph API /me endpoint
 */
export interface InstagramApiUserResponse {
  id: string;
  username: string;
  name?: string;
  account_type?: 'BUSINESS' | 'MEDIA_CREATOR' | 'PERSONAL' | string;
  profile_picture_url?: string;
}

/**
 * Raw response from Meta/Instagram OAuth access_token exchange
 */
export interface InstagramTokenResponse {
  access_token: string;
  user_id?: string | number;
  token_type?: string;
  expires_in?: number;
}

/**
 * Long-lived token exchange response
 */
export interface InstagramLongLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Clean Instagram profile information exposed to frontend (NO tokens or secrets)
 */
export interface InstagramProfileData {
  id: string;
  userId: string;
  instagramUserId: string;
  username: string;
  name: string | null;
  accountType: string | null;
  profilePictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Auth state returned by GET /api/auth/me or session checks
 */
export interface AuthState {
  authenticated: boolean;
  user?: {
    id: string;
    createdAt: string;
  };
  instagramAccount?: InstagramProfileData;
  error?: string;
}
