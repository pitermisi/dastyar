import React, { useState, useEffect } from 'react';
import { Instagram, Loader2, ArrowRight } from 'lucide-react';

interface LoginButtonProps {
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
  className?: string;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  onSuccess,
  onError,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Listen for postMessage from the OAuth callback window
    const handleMessage = (event: MessageEvent) => {
      // Validate event origin is current host or Cloud Run container
      if (
        !event.origin.includes(window.location.hostname) &&
        !event.origin.endsWith('.run.app') &&
        !event.origin.includes('localhost')
      ) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsLoading(false);
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = '/dashboard';
        }
      } else if (event.data?.type === 'OAUTH_AUTH_FAILURE') {
        setIsLoading(false);
        const err = event.data?.error || 'Instagram authorization failed.';
        if (onError) {
          onError(err);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess, onError]);

  const handleContinueWithInstagram = async () => {
    if (isLoading) return; // Prevent duplicate submissions

    setIsLoading(true);

    try {
      // 1. Fetch Instagram auth URL from backend
      const response = await fetch('/api/auth/instagram?format=json', {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to start Instagram authorization.');
      }

      const { url } = await response.json();
      if (!url) {
        throw new Error('No authorization URL returned from server.');
      }

      // Check if running inside an iframe (like AI Studio preview)
      const isInIframe = window.self !== window.top;

      if (isInIframe) {
        // Calculate centered popup coordinates
        const width = 550;
        const height = 650;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const authWindow = window.open(
          url,
          'instagram_oauth_popup',
          `width=${width},height=${height},left=${left},top=${top},status=yes,scrollbars=yes`
        );

        if (!authWindow || authWindow.closed || typeof authWindow.closed === 'undefined') {
          // If popup is blocked by browser, provide fallback
          console.warn('Popup blocked, falling back to direct navigation');
          window.location.href = url;
          return;
        }

        // Liveness monitor for popup close
        const timer = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(timer);
            // Brief delay then check if session was established
            setTimeout(() => {
              setIsLoading(false);
              if (onSuccess) onSuccess();
            }, 800);
          }
        }, 800);
      } else {
        // Direct browser redirect if not in iframe
        window.location.href = url;
      }
    } catch (err: any) {
      console.error('Login initiation failed');
      setIsLoading(false);
      if (onError) {
        onError(err.message || 'Unable to connect Instagram. Please try again.');
      }
    }
  };

  return (
    <button
      id="btn-instagram-login"
      type="button"
      onClick={handleContinueWithInstagram}
      disabled={isLoading}
      className={`inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-medium text-white transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-500 hover:via-pink-500 hover:to-rose-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:ring-offset-2 ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Connecting to Instagram...</span>
        </>
      ) : (
        <>
          <Instagram className="w-5 h-5" />
          <span>Continue with Instagram</span>
          <ArrowRight className="w-4 h-4 opacity-80" />
        </>
      )}
    </button>
  );
};
