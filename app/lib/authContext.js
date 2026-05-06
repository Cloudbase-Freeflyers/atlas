"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';
import { loginAction, signupAction, logoutAction, getMeAction } from './authActions';

const AuthContext = createContext(null);

export const AuthProvider = ({ children, initialUser }) => {
  const [user, setUser] = useState(initialUser || null);
  const [loading, setLoading] = useState(initialUser === undefined);
  const isAnonymous = user?.email === 'Anonymous';
  const router = useRouter();
  const pathname = usePathname();

  const logout = useCallback(async () => {
    await logoutAction();
    setUser(null);
    router.push('/login');
  }, [router]);

  const checkUser = useCallback(async () => {
    // auth_token is httpOnly so js-cookie cannot read it — use server action directly
    const sToken = Cookies.get('shareable_token');

    if (sToken) {
      setUser({ email: 'Anonymous', role: 'customer' });
      setLoading(false);
      return;
    }

    try {
      const userData = await getMeAction();
      if (userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    // Check for shareable token in URL
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get('token');
    if (urlToken) {
      Cookies.set('shareable_token', urlToken, { expires: 7 });
    }

    // If no user from server, try to resolve client-side via server action
    if (!initialUser) {
      checkUser();
    }
  }, [checkUser, initialUser]);

  const login = async (username, password) => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    
    const result = await loginAction(formData);
    if (result.success) {
      await checkUser();
      router.push('/reports');
    }
    return result;
  };

  const signup = async (email, password) => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    
    return await signupAction(formData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, isAnonymous, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
