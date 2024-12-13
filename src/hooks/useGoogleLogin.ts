import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export const useGoogleLogin = () => {
  const router = useRouter();
  const [credential, setCredential] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const handleGoogleLogin = async (credentialResponse: any) => {
    setLoggingIn(true);
    setCredential(credentialResponse.credential);
  };

  const handleLoginError = () => {
    router.push('/login');
  };

  const handleGoogleRegisterAndLogin = async () => {
    try {
      setLoggingIn(true);
      const response = await axios.post('http://localhost:4000/api/google', {
        credential: credential,
      });
      // Have the user her incase we want it later
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      router.push('/dashboard');
    } catch (error) {
      console.log(error);
    } finally {
      setLoggingIn(false);
    }
  };

  useEffect(() => {
    if (credential) {
      handleGoogleRegisterAndLogin();
    }
    return () => {};
  }, [credential]);

  return {
    loggingIn,
    credential,
    handleGoogleLogin,
    handleLoginError,
  };
};
