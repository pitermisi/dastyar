import type {
  InstagramApiUserResponse,
  InstagramTokenResponse,
  InstagramLongLivedTokenResponse,
} from '../types/instagram.js';

const INSTAGRAM_AUTH_URL = 'https://api.instagram.com/oauth/authorize';
const INSTAGRAM_TOKEN_URL = 'https://api.instagram.com/oauth/access_token';
const INSTAGRAM_GRAPH_URL = 'https://graph.instagram.com';

/**
 * Returns configured Meta App ID
 */
export function getMetaAppId(): string {
  const appId = process.env.META_APP_ID || process.env.INSTAGRAM_CLIENT_ID || '';
  return appId.trim();
}

/**
 * Returns configured Meta App Secret
 */
export function getMetaAppSecret(): string {
  const secret = process.env.META_APP_SECRET || process.env.INSTAGRAM_CLIENT_SECRET || '';
  return secret.trim();
}

/**
 * Resolves the OAuth redirect URI from env or request origin
 */
export function getInstagramRedirectUri(requestOrigin?: string): string {
  if (process.env.INSTAGRAM_REDIRECT_URI) {
    return process.env.INSTAGRAM_REDIRECT_URI.trim();
  }
  const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || requestOrigin || 'http://localhost:3000';
  const cleanBase = baseUrl.replace(/\/$/, '');
  return `${cleanBase}/api/auth/instagram/callback`;
}

/**
 * Generates the Instagram authorization URL
 */
export function buildInstagramAuthUrl(options: {
  redirectUri: string;
  state: string;
  scope?: string;
}): string {
  const clientId = getMetaAppId();
  if (!clientId) {
    throw new Error('META_APP_ID is not configured in environment variables.');
  }

  // Minimum required permissions for Instagram Login
  const defaultScope = 'instagram_business_basic';
  const scope = options.scope || process.env.INSTAGRAM_SCOPES || defaultScope;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: options.redirectUri,
    response_type: 'code',
    scope: scope,
    state: options.state,
  });

  return `${INSTAGRAM_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchanges the temporary authorization code for an Instagram user access token.
 * Never logs or exposes credentials.
 */
export async function exchangeCodeForAccessToken(
  code: string,
  redirectUri: string
): Promise<InstagramTokenResponse> {
  const clientId = getMetaAppId();
  const clientSecret = getMetaAppSecret();

  if (!clientId || !clientSecret) {
    throw new Error('Meta credentials (META_APP_ID or META_APP_SECRET) are missing.');
  }

  const formData = new URLSearchParams();
  formData.append('client_id', clientId);
  formData.append('client_secret', clientSecret);
  formData.append('grant_type', 'authorization_code');
  formData.append('redirect_uri', redirectUri);
  formData.append('code', code);

  const response = await fetch(INSTAGRAM_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    // Read response text for internal diagnostic only, but sanitize before re-throwing
    const errBody = await response.text();
    // Do not leak secret in message
    console.error('Failed token exchange status:', response.status);
    throw new Error('Instagram access token exchange failed. Please verify your Meta App ID, Secret, and Redirect URI.');
  }

  const data = (await response.json()) as InstagramTokenResponse;
  if (!data.access_token) {
    throw new Error('Instagram access token exchange failed: No access token returned.');
  }

  return data;
}

/**
 * Optionally exchanges a short-lived token for a 60-day long-lived token.
 * Falls back to short-lived token if exchange fails.
 */
export async function exchangeForLongLivedToken(
  shortLivedToken: string
): Promise<{ accessToken: string; expiresInSeconds?: number }> {
  const clientSecret = getMetaAppSecret();
  if (!clientSecret) {
    return { accessToken: shortLivedToken };
  }

  try {
    const url = new URL(`${INSTAGRAM_GRAPH_URL}/access_token`);
    url.searchParams.set('grant_type', 'ig_exchange_token');
    url.searchParams.set('client_secret', clientSecret);
    url.searchParams.set('access_token', shortLivedToken);

    const response = await fetch(url.toString(), { method: 'GET' });
    if (response.ok) {
      const data = (await response.json()) as InstagramLongLivedTokenResponse;
      if (data.access_token) {
        return {
          accessToken: data.access_token,
          expiresInSeconds: data.expires_in,
        };
      }
    }
  } catch (err) {
    // Non-fatal, proceed with short-lived token
    console.warn('Long-lived token exchange bypassed, using short-lived token.');
  }

  return { accessToken: shortLivedToken, expiresInSeconds: 3600 };
}

/**
 * Retrieves the authenticated Instagram user's basic profile.
 * Only requests the minimum allowed fields: id, username, name, account_type, profile_picture_url.
 */
export async function getInstagramUserProfile(
  accessToken: string
): Promise<InstagramApiUserResponse> {
  const fields = 'id,username,name,account_type,profile_picture_url';
  const url = `${INSTAGRAM_GRAPH_URL}/me?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(accessToken)}`;

  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    console.error('Failed to retrieve profile, status:', response.status);
    throw new Error('Instagram profile could not be retrieved.');
  }

  const profile = (await response.json()) as InstagramApiUserResponse;
  if (!profile.id || !profile.username) {
    throw new Error('Instagram profile is missing required identifiers.');
  }

  return profile;
}
