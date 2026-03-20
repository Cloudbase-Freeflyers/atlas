"use client";

import { useAuth } from './lib/authContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const PUBLIC_ROUTES = ['/', '/login', '/signup'];

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

export const Navigation = () => {
    const { user, logout, isAnonymous } = useAuth();
    const pathname = usePathname();
    
    // Don't show generic nav on login/signup pages
    if (['/login', '/signup'].includes(pathname)) return null;

    return (
        <nav className="nav">
            <div className="container">
                <div className="nav-content">
                    <a href="/" className="nav-logo">
                        <span className="logo-text">C6</span>
                        <span className="logo-divider">/</span>
                        <span className="logo-sub">Atlas</span>
                    </a>
                    <div className="nav-actions">
                        {user && !isAnonymous ? (
                            <>
                                <a href="/reports" className="nav-cta nav-cta-secondary">
                                    Reports
                                </a>
                                {user.role === 'admin' && (
                                    <a href="/admin/users" className="nav-cta nav-cta-secondary">
                                        Admin
                                    </a>
                                )}
                                <button onClick={logout} className="nav-cta">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                {isAnonymous && (
                                    <span className="tw:text-xs tw:text-zinc-500 tw:bg-white/5 tw:px-2 tw:py-1 tw:rounded">Guest View</span>
                                )}
                                <a href="/login" className="nav-cta nav-cta-secondary">
                                    Login
                                </a>
                                <a href="#contact" className="nav-cta">
                                    Get Started
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
