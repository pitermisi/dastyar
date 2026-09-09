import React, { useEffect, useState } from 'react';
import { LandingPage } from './components/landing/LandingPage.js';
import { DashboardLayout } from './components/dashboard/DashboardLayout.js';
import { OverviewPage } from './pages/dashboard/OverviewPage.js';
import { AutomationPage } from './pages/AutomationPage.js';
import { ContentPlannerPage } from './pages/ContentPlannerPage.js';
import { ContentGeneratorPage } from './pages/ContentGeneratorPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { CaptionsPage } from './pages/CaptionsPage.js';
import { TrendsPage } from './pages/TrendsPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import type { InstagramProfileData, AuthState } from '../types/instagram.js';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>({ authenticated: false });
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) {
      setErrorMessage(decodeURIComponent(err));
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    checkAuth();

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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setAuthState({ authenticated: false });
    navigate('/');
  };

  // Auth guard for dashboard routes
  const isDashboardRoute = currentPath.startsWith('/dashboard');

  useEffect(() => {
    if (!isCheckingAuth && isDashboardRoute && !authState.authenticated) {
      navigate('/');
    }
  }, [isCheckingAuth, isDashboardRoute, authState.authenticated]);

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-purple-500/20 border-t-purple-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">در حال بررسی احراز هویت...</p>
        </div>
      </div>
    );
  }

  // Landing page for non-authenticated users or root path
  if (!isDashboardRoute || !authState.authenticated) {
    return (
      <div dir="rtl">
        {errorMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-lg text-sm flex items-center gap-3 max-w-md animate-fade-in">
            <span className="font-medium">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700 font-bold shrink-0">
              بستن
            </button>
          </div>
        )}
        <LandingPage
          isAuthenticated={authState.authenticated}
          onLoginSuccess={handleLoginSuccess}
          onLoginError={(msg) => setErrorMessage(msg)}
          onNavigateDashboard={() => {
            if (authState.authenticated) {
              navigate('/dashboard');
            } else {
              navigate('/');
            }
          }}
        />
      </div>
    );
  }

  // Dashboard routes
  const renderDashboardContent = () => {
    switch (currentPath) {
      case '/dashboard':
        return <OverviewPage profile={authState.instagramAccount!} />;
      case '/dashboard/automation':
        return <AutomationPage />;
      case '/dashboard/content-planner':
        return <ContentPlannerPage />;
      case '/dashboard/content-generator':
        return <ContentGeneratorPage />;
      case '/dashboard/analytics':
        return <AnalyticsPage />;
      case '/dashboard/captions':
        return <CaptionsPage />;
      case '/dashboard/trends':
        return <TrendsPage />;
      case '/dashboard/settings':
        return <SettingsPage />;
      default:
        return <OverviewPage profile={authState.instagramAccount!} />;
    }
  };

  return (
    <div dir="rtl">
      <DashboardLayout
        profile={authState.instagramAccount}
        currentPath={currentPath}
        navigate={navigate}
        onLogout={handleLogout}
      >
        {renderDashboardContent()}
      </DashboardLayout>
    </div>
  );
}
