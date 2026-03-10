"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import api from './api';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const logout = useCallback(() => {
    Cookies.remove('auth_token');
    Cookies.remove('shareable_token');
    setUser(null);
    setIsAnonymous(false);
    router.push('/login');
  }, [router]);

  const checkUser = useCallback(async () => {
    const token = Cookies.get('auth_token');
    const sToken = Cookies.get('shareable_token');

    if (!token && !sToken) {
      setUser(null);
      setIsAnonymous(false);
      setLoading(false);
      return;
    }

    if (token) {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
        setIsAnonymous(false);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        logout();
      }
    } else if (sToken) {
      // Logic for shareable token (anonymous)
      setUser({ email: 'Anonymous', role: 'customer' }); // Mock user for anonymous
      setIsAnonymous(true);
    }
    
    setLoading(false);
  }, [logout]);

  useEffect(() => {
    // Check for shareable token in URL
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get('token');
    if (urlToken) {
      Cookies.set('shareable_token', urlToken, { expires: 7 });
    }

    checkUser();
  }, [checkUser]);

  const login = async (username, password) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    try {
      const response = await api.post('/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const { access_token } = response.data;
      Cookies.set('auth_token', access_token, { expires: 7 }); // Set cookie for 7 days
      await checkUser();
      router.push('/reports');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const signup = async (email, password) => {
    try {
      await api.post('/users/', { email, password, role: 'customer' });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Signup failed' 
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, isAnonymous }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
