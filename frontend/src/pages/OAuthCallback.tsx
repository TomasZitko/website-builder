import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const refreshToken = searchParams.get('refreshToken');
  const error = searchParams.get('error');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleOAuthCallback = async () => {
      if (error) {
        setStatus('error');
        timeoutId = setTimeout(() => {
          navigate('/login');
        }, 3000);
        return;
      }

      if (!token || !refreshToken) {
        setStatus('error');
        timeoutId = setTimeout(() => {
          navigate('/login');
        }, 3000);
        return;
      }

      try {
        // Store tokens in auth store
        // Note: We don't have full user info yet, but we have the token
        // The app will fetch user info or it's included in token

        // For now, store tokens and let the app handle user data fetching
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refreshToken);

        // Decode token to get user info (simple JWT decode)
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Set minimal auth state
        setAuth(
          {
            id: payload.userId,
            email: payload.email,
            firstName: '',
            lastName: '',
            subscriptionTier: 'free'
          },
          token
        );

        setStatus('success');

        // Redirect to dashboard after 1 second
        timeoutId = setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        timeoutId = setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleOAuthCallback();

    // Cleanup timeout on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [token, refreshToken, error, navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <div className="mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Signing you in...
            </h1>
            <p className="text-gray-600">
              Please wait while we complete your authentication
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              Success!
            </h1>
            <p className="text-gray-600">
              Redirecting to your dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Authentication Failed
            </h1>
            <p className="text-gray-600 mb-6">
              {error === 'oauth_failed'
                ? 'OAuth authentication failed. Please try again.'
                : 'Something went wrong during authentication.'}
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to login page...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
