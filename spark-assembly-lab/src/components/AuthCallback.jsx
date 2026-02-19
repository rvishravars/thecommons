import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { handleOAuthCallback } from '../utils/github';

export default function AuthCallback() {
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Get authorization code from URL
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const errorParam = params.get('error');

      if (errorParam) {
        setError(`Authorization failed: ${errorParam}`);
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
        return;
      }

      // Exchange code for token
      const result = await handleOAuthCallback(code);

      if (result.success) {
        // Redirect to home page
        window.location.href = '/';
      } else {
        setError(result.error || 'Authentication failed');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    };

    handleCallback();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
          <p className="text-red-500">{error}</p>
          <p className="text-sm theme-subtle mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <Loader className="h-8 w-8 animate-spin" />
      <p className="text-lg font-semibold">Completing authentication...</p>
    </div>
  );
}
