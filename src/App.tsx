import React, { useEffect, useState } from 'react';
import { Instagram, AlertCircle, Sparkles, Database, CheckCircle, ExternalLink } from 'lucide-react';
import { LoginButton } from './components/LoginButton.js';
import { InstagramProfile } from './components/InstagramProfile.js';
import type { InstagramProfileData, AuthState } from './types/instagram.js';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>({ authenticated: false });
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  const [configInfo, setConfigInfo] = useState<{
    databaseConfigured: boolean;
    metaConfigured: boolean;
  } | null>(null);

  // Fetch authentication status from backend
  const checkAuth = async () => {
    setIsCheckingAuth(true);
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setAuthState(data);
      } else {
        setAuthState({ authenticated: false });
      }
    } catch {
      setAuthState({ authenticated: false });
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // Fetch health/configuration status
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setConfigInfo({
          databaseConfigured: data.databaseConfigured,
          metaConfigured: data.metaConfigured,
        });
      })
      .catch(() => {});
  }, []);

  // Check initial URL parameters for errors or path changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) {
      setErrorMessage(decodeURIComponent(err));
      // Clean query string without full reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    checkAuth();

    // Listen for browser navigation (popstate)
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const handleLoginSuccess = () => {
    setErrorMessage(null);
    checkAuth().then(() => {
      navigate('/dashboard');
    });
  };

  const handleLogoutSuccess = () => {
    setAuthState({ authenticated: false });
    navigate('/');
  };

  // Handle protected dashboard route
  const isDashboardView = currentPath === '/dashboard';

  // If user visits /dashboard while unauthenticated (after check finishes), redirect to /
  useEffect(() => {
    if (!isCheckingAuth && isDashboardView && !authState.authenticated) {
      navigate('/');
    }
  }, [isCheckingAuth, isDashboardView, authState.authenticated]);

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-pink-500/20 border-t-pink-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-pink-100 selection:text-pink-900">
      {/* Top Navigation / Brand Bar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(authState.authenticated ? '/dashboard' : '/')}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-sm">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-slate-900 text-base tracking-tight block">
                Instagram AI Dashboard
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:block">MVP v1.0</span>
            </div>
          </button>

          {/* Quick status pill */}
          <div className="flex items-center gap-3">
            {configInfo && !configInfo.metaConfigured && (
              <span
                title="META_APP_ID or META_APP_SECRET missing in .env"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Meta Secrets Needed
              </span>
            )}

            {authState.authenticated && authState.instagramAccount && (
              <button
                onClick={() => navigate('/dashboard')}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg transition"
              >
                @{authState.instagramAccount.username}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center max-w-5xl w-full mx-auto px-4 sm:px-6 py-12">
        {/* Error notification banner if any */}
        {errorMessage && (
          <div
            id="banner-auth-error"
            className="mb-8 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 shadow-xs max-w-xl mx-auto w-full"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{errorMessage}</p>
              <p className="text-xs text-rose-600 mt-1">
                Please verify your Meta App settings, Redirect URI, or test account permissions.
              </p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 text-xs font-semibold px-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View Switch: Dashboard or Home */}
        {isDashboardView && authState.authenticated && authState.instagramAccount ? (
          <section id="section-dashboard" className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-sm text-slate-500 mt-1">
                Connected Instagram account and session details
              </p>
            </div>

            <InstagramProfile
              profile={authState.instagramAccount}
              onLogoutSuccess={handleLogoutSuccess}
            />
          </section>
        ) : (
          <section id="section-home" className="max-w-xl mx-auto w-full text-center space-y-8">
            {/* Hero Section */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200/60 text-pink-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Production-Ready OAuth MVP
              </div>

              <h1 id="title-product" className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                Instagram AI Dashboard
              </h1>

              <p id="desc-product" className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
                Connect your Instagram account to get started.
              </p>
            </div>

            {/* Login CTA Card */}
            <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="space-y-2 text-left">
                <h3 className="font-semibold text-slate-900 text-base">Authorize with Meta</h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Authenticates via official Instagram Login. Tokens are encrypted server-side with AES-256-GCM and never exposed to client-side scripts.
                </p>
              </div>

              <div className="pt-2 flex flex-col items-center">
                <LoginButton
                  onSuccess={handleLoginSuccess}
                  onError={(msg) => setErrorMessage(msg)}
                  className="w-full sm:w-auto"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Instagram Graph API
                </span>
                <span>Minimum Scope: Basic Profile</span>
              </div>
            </div>

            {/* If user is already authenticated but on home page */}
            {authState.authenticated && authState.instagramAccount && (
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 text-sm flex items-center justify-between">
                <div className="text-left">
                  <p className="font-semibold">Already logged in as @{authState.instagramAccount.username}</p>
                  <p className="text-xs text-purple-700">Continue to your connected dashboard</p>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs"
                >
                  Go to Dashboard →
                </button>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Instagram AI Dashboard. Built with TypeScript, Next/Vite, Prisma & PostgreSQL.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>OAuth 2.0</span>
            <span>•</span>
            <span>AES-256-GCM</span>
            <span>•</span>
            <span>Server Session</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
