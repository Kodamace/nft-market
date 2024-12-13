//src/app/page.tsx
'use client';
import Link from 'next/link';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Fragment } from 'react';
import { useGoogleLogin } from '@/hooks/useGoogleLogin';

const HomePage = () => {
  const {
    credential,
    loggingIn,
    googleScriptLoading,
    handleGoogleLogin,
    handleLoginError,
    setGoogleScriptLoading,
  } = useGoogleLogin();

  if (googleScriptLoading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {loggingIn || credential ? (
        <p>Logging in...</p>
      ) : (
        <Fragment>
          <h1 className="text-4xl font-bold mb-4 dark:text-white">
            Welcome to My Fashion App
          </h1>
          <div className="space-x-4 flex">
            <Link
              href="/register"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Register
            </Link>
            <Link
              href="/login"
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Login
            </Link>
            <GoogleOAuthProvider
              clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}
            >
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={handleLoginError}
              />
            </GoogleOAuthProvider>
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default HomePage;
