import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import {
  buildInstagramAuthUrl,
  exchangeCodeForAccessToken,
  exchangeForLongLivedToken,
  getInstagramUserProfile,
  getInstagramRedirectUri,
  getMetaAppId,
  getMetaAppSecret,
} from './lib/instagram.js';
import {
  generateOAuthState,
  getSessionCookieOptions,
  syncInstagramUser,
  createSession,
  getSessionUser,
  destroySession,
  SESSION_COOKIE_NAME,
  OAUTH_STATE_COOKIE_NAME,
} from './lib/auth.js';
import { isDatabaseConfigured } from './lib/prisma.js';

const app = express();
const isAiStudio = Boolean(process.env.APPLET_ID || process.env.APPLET_DIR);
const PORT = isAiStudio ? 3000 : (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);
const distIndexExists = fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'));
const isProduction = process.env.NODE_ENV === 'production' || (distIndexExists && process.env.NODE_ENV !== 'development');

// Essential middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Trust proxy for secure cookies behind reverse proxies (Cloud Run, Railway, Nginx)
app.set('trust proxy', 1);

/* ==========================================================================
   API Endpoints
   ========================================================================== */

/**
 * Health & Configuration Check
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    databaseConfigured: isDatabaseConfigured(),
    metaConfigured: Boolean(getMetaAppId() && getMetaAppSecret()),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Initiates Instagram OAuth flow:
 * Generates CSRF state, stores in cookie, and either returns auth URL or redirects.
 */
app.get(['/api/auth/instagram', '/api/auth/instagram/'], (req: Request, res: Response) => {
  try {
    const metaAppId = getMetaAppId();
    if (!metaAppId) {
      return res.status(400).json({
        error: 'META_APP_ID is not configured. Please set META_APP_ID and META_APP_SECRET in your environment variables.',
      });
    }

    const state = generateOAuthState();
    const cookieOptions = getSessionCookieOptions(isProduction);

    // Store state in an HTTP-only cookie valid for 15 minutes
    res.cookie(OAUTH_STATE_COOKIE_NAME, state, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    const requestOrigin = `${req.protocol}://${req.get('host')}`;
    const redirectUri = getInstagramRedirectUri(requestOrigin);
    const authUrl = buildInstagramAuthUrl({
      redirectUri,
      state,
    });

    // If client requested JSON (e.g. for popup flow), send URL
    if (req.query.format === 'json' || req.headers.accept?.includes('application/json')) {
      return res.json({ url: authUrl, redirectUri });
    }

    // Otherwise redirect directly
    return res.redirect(authUrl);
  } catch (error: any) {
    console.error('Failed to initiate Instagram login');
    return res.status(500).json({
      error: 'Unable to initiate Instagram authorization. Please check server configuration.',
    });
  }
});

/**
 * Handles OAuth callback from Instagram:
 * GET /api/auth/instagram/callback
 */
app.get(['/api/auth/instagram/callback', '/api/auth/instagram/callback/'], async (req: Request, res: Response) => {
  const { code, state, error, error_reason, error_description } = req.query;

  // 1. Handle user denied or Meta returned error
  if (error || error_reason) {
    console.warn('Instagram OAuth denied or failed:', error_reason || error);
    const message = encodeURIComponent('Instagram authorization was cancelled or denied.');
    return sendCallbackResponse(res, false, message);
  }

  // 2. Validate code presence
  if (!code || typeof code !== 'string') {
    return sendCallbackResponse(res, false, 'No authorization code provided.');
  }

  // 3. Validate state parameter (CSRF protection)
  const savedState = req.cookies[OAUTH_STATE_COOKIE_NAME];
  if (state && savedState && state !== savedState) {
    console.warn('OAuth state mismatch');
    return sendCallbackResponse(res, false, 'OAuth state verification failed. Please try again.');
  }

  // Clear state cookie
  res.clearCookie(OAUTH_STATE_COOKIE_NAME, getSessionCookieOptions(isProduction));

  try {
    const requestOrigin = `${req.protocol}://${req.get('host')}`;
    const redirectUri = getInstagramRedirectUri(requestOrigin);

    // 4. Exchange code for short-lived access token
    const tokenResult = await exchangeCodeForAccessToken(code, redirectUri);

    // 5. Attempt upgrade to 60-day long-lived token
    const { accessToken, expiresInSeconds } = await exchangeForLongLivedToken(tokenResult.access_token);

    // 6. Retrieve authenticated Instagram user basic profile
    const profile = await getInstagramUserProfile(accessToken);

    // 7. Store user and Instagram account in PostgreSQL (with encrypted token)
    const { userId } = await syncInstagramUser(profile, accessToken, expiresInSeconds);

    // 8. Create server-side session
    const sessionId = await createSession(userId);

    // 9. Set HTTP-only secure session cookie
    res.cookie(SESSION_COOKIE_NAME, sessionId, getSessionCookieOptions(isProduction));

    return sendCallbackResponse(res, true);
  } catch (err: any) {
    console.error('Instagram callback processing error:', err?.message || 'Unknown error');
    const safeErrorMessage = 'Unable to connect Instagram account. Please try again.';
    return sendCallbackResponse(res, false, safeErrorMessage);
  }
});

/**
 * Helper to respond to OAuth callback.
 * Supports both popup window communication via postMessage and direct redirect.
 */
function sendCallbackResponse(res: Response, success: boolean, errorMessage?: string) {
  const redirectTarget = success ? '/dashboard' : `/?error=${encodeURIComponent(errorMessage || 'Auth Failed')}`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Instagram Authentication</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; }
    .card { background: #1e293b; padding: 32px; border-radius: 16px; text-align: center; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .status { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
    .sub { font-size: 14px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="status">${success ? 'Authentication Successful!' : 'Authentication Failed'}</div>
    <div class="sub">${success ? 'Closing window and redirecting...' : (errorMessage || 'Please try again.')}</div>
  </div>
  <script>
    (function() {
      const isSuccess = ${JSON.stringify(success)};
      const errorMsg = ${JSON.stringify(errorMessage || '')};

      if (window.opener) {
        try {
          window.opener.postMessage({
            type: isSuccess ? 'OAUTH_AUTH_SUCCESS' : 'OAUTH_AUTH_FAILURE',
            error: errorMsg
          }, '*');
          setTimeout(function() { window.close(); }, 800);
        } catch (e) {
          window.location.href = '${redirectTarget}';
        }
      } else {
        setTimeout(function() {
          window.location.href = '${redirectTarget}';
        }, 1000);
      }
    })();
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  return res.send(html);
}

/**
 * GET /api/auth/me
 * Returns current authenticated user and Instagram profile data (never tokens).
 */
app.get('/api/auth/me', async (req: Request, res: Response) => {
  const sessionId = req.cookies[SESSION_COOKIE_NAME];
  if (!sessionId) {
    return res.json({ authenticated: false });
  }

  try {
    const sessionData = await getSessionUser(sessionId);
    if (!sessionData) {
      // Session expired or invalid
      res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions(isProduction));
      return res.json({ authenticated: false, error: 'Session expired. Please login again.' });
    }

    return res.json({
      authenticated: true,
      user: sessionData.user,
      instagramAccount: sessionData.instagramAccount,
    });
  } catch (error) {
    console.error('Error verifying session');
    return res.status(500).json({ authenticated: false, error: 'Internal server error verifying session' });
  }
});

/**
 * POST /api/auth/logout
 * Destroys server-side session and clears cookie.
 */
app.post(['/api/auth/logout', '/api/auth/logout/'], async (req: Request, res: Response) => {
  const sessionId = req.cookies[SESSION_COOKIE_NAME];
  if (sessionId) {
    await destroySession(sessionId).catch(() => {});
  }

  res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions(isProduction));
  return res.json({ success: true, message: 'Logged out successfully' });
});

/* ==========================================================================
   Vite & Static Assets Integration
   ========================================================================== */

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true as const,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Instagram AI Dashboard server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
