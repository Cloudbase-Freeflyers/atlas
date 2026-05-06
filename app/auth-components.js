"use client";

import { useAuth } from './lib/authContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const PUBLIC_ROUTES = ['/', '/login', '/signup'];
const SIDEBAR_ROUTES = ['/reports', '/admin'];

export const AuthGuard = ({ children }) => {
  const { user, loading, isAnonymous } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && !PUBLIC_ROUTES.includes(pathname)) {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="tw:min-h-screen tw:flex tw:items-center tw:justify-center tw:bg-zinc-950">
        <div className="tw:flex tw:flex-col tw:items-center tw:gap-4">
          <div className="tw:w-12 tw:h-12 tw:border-4 tw:border-white/10 tw:border-t-white tw:rounded-full tw:animate-spin"></div>
          <span className="tw:text-zinc-500 tw:text-sm tw:font-medium">Initializing Atlas...</span>
        </div>
      </div>
    );
  }

  return children;
};
