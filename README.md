# Instagram AI Dashboard (MVP)

Production-ready MVP foundation for a multi-user Instagram management and AI assistant platform. 

This initial release implements secure, server-side Meta OAuth 2.0 authentication, access token encryption, PostgreSQL session and account persistence with Prisma, and an authenticated profile dashboard.

---

## 1. Project Overview

- **Instagram Login**: Official Meta OAuth 2.0 flow (`https://api.instagram.com/oauth/authorize`) requesting minimum required basic profile permissions.
- **Server-Side Token Exchange**: Authorization codes are exchanged server-side via `https://api.instagram.com/oauth/access_token` and upgraded to 60-day long-lived tokens.
- **Access Token Encryption**: Access tokens are encrypted at rest using AES-256-GCM before storage in PostgreSQL. Tokens are never exposed to the client, cookies, logs, or URLs.
- **Multi-User Architecture**: Independent database relations separating Users, Instagram Accounts, and Sessions (`User → InstagramAccount → Encrypted Token`).
- **Profile Dashboard**: Displays authenticated Instagram handle (`@username`), Display Name, Instagram ID, Account Type, and Profile Picture with server-side session revocation on logout.

---

## 2. Technology Stack

- **Language**: TypeScript
- **Frontend**: React 19 + Tailwind CSS + Lucide Icons
- **Backend**: Node.js + Express + Vite Middleware (single deployable service)
- **Database**: PostgreSQL
- **ORM**: Prisma (schema and SQL migrations included)
- **Encryption**: Node.js `crypto` (AES-256-GCM with authenticated tags)
- **Authentication**: Secure, HTTP-only, SameSite server sessions
- **Deployment**: Single-service deployment target for Railway or container environments

---

## 3. Architecture

```text
Browser
  ↓ [Continue with Instagram]
GET /api/auth/instagram
  ↓ (Generates CSRF state, redirects to Meta)
https://api.instagram.com/oauth/authorize
  ↓ (User approves permissions)
GET /api/auth/instagram/callback?code=...&state=...
  ↓ (Validate CSRF state)
POST https://api.instagram.com/oauth/access_token (Server-to-Server exchange)
  ↓ (Short-lived token → Long-lived token)
GET https://graph.instagram.com/me?fields=id,username,name,account_type,profile_picture_url
  ↓ (AES-256-GCM Encryption)
PostgreSQL (Users, InstagramAccounts, Sessions via Prisma)
  ↓ (Set HTTP-only session cookie)
Redirect to /dashboard
```

---

## 4. Local Installation & Setup

### Prerequisites
- Node.js v18+ (v20+ recommended)
- PostgreSQL database (local or cloud like Railway / Supabase / Neon)
- Meta Developer account

### Step 1: Clone and Install Dependencies
```bash
git clone <repository-url>
cd instagram-ai-dashboard
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in your variables in `.env`:
```env
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/auth/instagram/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/instagram_dashboard
SESSION_SECRET=a_secure_random_string_with_minimum_32_characters
```

### Step 3: Database Initialization
Generate Prisma Client and apply migrations:
```bash
# Generate the Prisma Client
npx prisma generate

# Apply migrations to your PostgreSQL database
npx prisma migrate dev --name init
```

### Step 4: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Meta Developer Dashboard Configuration

To obtain your `META_APP_ID` and `META_APP_SECRET`:

1. Navigate to the **[Meta for Developers](https://developers.facebook.com/)** dashboard.
2. Click **Create App** and select **Other** > **Business** or **Consumer**.
3. Under **Add products to your app**, locate **Instagram** and click **Set Up** (select **API Setup with Instagram Login** or **Instagram Graph API**).
4. Go to **Instagram** > **Basic Display** or **Instagram Settings** > **OAuth Settings**:
   - Add the **Valid OAuth Redirect URI**:
     - Local Dev: `http://localhost:3000/api/auth/instagram/callback`
     - Production/Railway: `https://<YOUR-RAILWAY-APP>.up.railway.app/api/auth/instagram/callback`
5. Go to **App Settings** > **Basic**:
   - Copy the **App ID** → paste into `META_APP_ID`.
   - Click Show next to **App Secret** → paste into `META_APP_SECRET`.
6. Add Instagram Test Users:
   - Go to **Roles** > **Roles** or **Instagram Test Users**.
   - Add the Instagram account you wish to test with.
   - On Instagram web/mobile, accept the tester invitation under **Settings > Apps and Websites > Tester Invites**.

---

## 6. Railway Deployment Guide

This project is configured as a single unified service (`npm run build` and `npm start`).

### Step 1: Push Code to GitHub
Ensure you have committed your changes to your GitHub repository (verify `.env` is never committed):
```bash
git add .
git commit -m "feat: Instagram Login & Profile Dashboard MVP"
git push origin main
```

### Step 2: Create Railway Project
1. Log in to [Railway](https://railway.com).
2. Click **New Project** > **Deploy from GitHub repo**.
3. Select your repository.

### Step 3: Add PostgreSQL Plugin
1. In your Railway project view, click **+ New** > **Database** > **PostgreSQL**.
2. Railway will automatically provision a PostgreSQL instance and provide a `DATABASE_URL` variable.

### Step 4: Configure Environment Variables in Railway
Under your app service in Railway, go to the **Variables** tab and configure:

| Variable | Value | Notes |
| :--- | :--- | :--- |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Auto-referenced from Railway Postgres |
| `META_APP_ID` | `<YOUR_META_APP_ID>` | From Meta Developer App |
| `META_APP_SECRET` | `<YOUR_META_APP_SECRET>` | From Meta Developer App |
| `INSTAGRAM_REDIRECT_URI` | `https://${{RAILWAY_PUBLIC_DOMAIN}}/api/auth/instagram/callback` | Matches Meta OAuth settings |
| `NEXT_PUBLIC_APP_URL` | `https://${{RAILWAY_PUBLIC_DOMAIN}}` | Your Railway domain |
| `SESSION_SECRET` | `<GENERATE_32_CHAR_RANDOM_STRING>` | Session & AES encryption secret |
| `NODE_ENV` | `production` | Production mode |

### Step 5: Database Migrations on Railway
Under **Settings** > **Deploy** in Railway, you can set the **Pre-deploy Command**:
```bash
npx prisma migrate deploy
```
Or run it once from the Railway CLI:
```bash
railway run npx prisma migrate deploy
```

---

## 7. Security Architecture

1. **Token Encryption**:
   - All access tokens are encrypted with **AES-256-GCM** with a unique initialization vector (IV) and authentication tag before insertion into PostgreSQL.
2. **Session Security**:
   - Server-side sessions using cryptographically random 32-byte session tokens.
   - Cookies are set with `HttpOnly`, `Secure`, and `SameSite=None` (or `Lax` in standalone web) to prevent JavaScript XSS theft and function reliably across secure contexts and iframes.
3. **CSRF State Verification**:
   - OAuth requests generate a unique 32-byte cryptographic state stored in a temporary HTTP-only cookie and validated upon callback.
4. **Zero Token Exposure**:
   - Access tokens are never returned by `/api/auth/me` or any frontend endpoint.
   - Stack traces and raw Meta API errors are never leaked to user clients.

---

## 8. Future Roadmap (Extensible Foundation)

The database schema and architecture are structured to expand seamlessly into:

- **Analytics Module**: Followers, engagement rates, reach, impressions, and media performance.
- **Content Management**: Reels, stories, scheduling, and direct publishing.
- **Comment Moderation & AI**: Webhook ingestion for comments, sentiment categorization, and automated responses.
- **Direct Messages (DMs)**: Ingestion via Meta Webhooks, conversation threads, and AI agent replies.
- **AI Growth Strategist**: Weekly content calendar generators, caption assistants, and hashtag recommendations.
