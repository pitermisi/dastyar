import React, { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';

interface LogoutButtonProps {
  onLogoutSuccess?: () => void;
  className?: string;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  onLogoutSuccess,
  className = '',
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (onLogoutSuccess) {
        onLogoutSuccess();
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Logout error');
      // Even if network fails, redirect to clear local state
      window.location.href = '/';
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      id="btn-logout"
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {isLoggingOut ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          <span>Logging out...</span>
        </>
      ) : (
        <>
          <LogOut className="w-4 h-4 text-slate-500" />
          <span>Logout</span>
        </>
      )}
    </button>
  );
};
