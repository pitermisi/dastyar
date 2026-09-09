import React, { useState, useEffect } from 'react';
import { Instagram, Loader2, ArrowLeft } from 'lucide-react';

interface LoginButtonProps {
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
  className?: string;
  label?: string;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  onSuccess,
  onError,
  className = '',
  label,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
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
        const err = event.data?.error || 'خطا در اتصال به اینستاگرام.';
        if (onError) {
          onError(err);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess, onError]);

  const handleContinueWithInstagram = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/instagram?format=json', {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'خطا در شروع احراز هویت اینستاگرام.');
      }

      const { url } = await response.json();
      if (!url) {
        throw new Error('آدرس احراز هویت از سرور دریافت نشد.');
      }

      const isInIframe = window.self !== window.top;

      if (isInIframe) {
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
          window.location.href = url;
          return;
        }

        const timer = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(timer);
            setTimeout(() => {
              setIsLoading(false);
              if (onSuccess) onSuccess();
            }, 800);
          }
        }, 800);
      } else {
        window.location.href = url;
      }
    } catch (err: any) {
      console.error('Login initiation failed');
      setIsLoading(false);
      if (onError) {
        onError(err.message || 'خطا در اتصال به اینستاگرام. لطفاً دوباره تلاش کنید.');
      }
    }
  };

  return (
    <button
      id="btn-instagram-login"
      type="button"
      onClick={handleContinueWithInstagram}
      disabled={isLoading}
      className={`inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-bold text-white transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed bg-gradient-to-l from-purple-600 via-pink-600 to-rose-500 hover:from-purple-500 hover:via-pink-500 hover:to-rose-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:ring-offset-2 ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>در حال اتصال...</span>
        </>
      ) : (
        <>
          <Instagram className="w-5 h-5" />
          <span>{label || 'اتصال به اینستاگرام'}</span>
          <ArrowLeft className="w-4 h-4 opacity-80" />
        </>
      )}
    </button>
  );
};
