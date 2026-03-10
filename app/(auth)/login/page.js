"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="tw:min-h-[calc(100vh-64px)] tw:flex tw:items-center tw:justify-center tw:bg-transparent tw:p-4">
      <div className="tw:w-full tw:max-w-md tw:p-8 tw:rounded-2xl tw:bg-white/5 tw:backdrop-blur-xl tw:border tw:border-white/10 tw:shadow-2xl">
        <div className="tw:text-center tw:mb-8">
          <div className="tw:inline-flex tw:items-center tw:gap-2 tw:mb-2">
            <span className="tw:text-3xl tw:font-bold tw:text-white">C6</span>
            <span className="tw:text-3xl tw:font-light tw:text-white/30">/</span>
            <span className="tw:text-3xl tw:font-light tw:text-white/70">Atlas</span>
          </div>
          <h1 className="tw:text-sm tw:uppercase tw:tracking-widest tw:text-zinc-500 tw:font-medium">
            Sign in to your account
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="tw:space-y-4">
          <div className="tw:space-y-2">
            <label className="tw:text-xs tw:text-zinc-400 tw:ml-1">Email Address</label>
            <Input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="tw:bg-white/5 tw:border-white/10 tw:text-white tw:h-12 tw:rounded-xl focus:tw:ring-2 focus:tw:ring-white/20"
              required
            />
          </div>

          <div className="tw:space-y-2">
            <label className="tw:text-xs tw:text-zinc-400 tw:ml-1">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="tw:bg-white/5 tw:border-white/10 tw:text-white tw:h-12 tw:rounded-xl focus:tw:ring-2 focus:tw:ring-white/20"
              required
            />
          </div>

          {error && (
            <div className="tw:p-3 tw:rounded-lg tw:bg-red-500/10 tw:border tw:border-red-500/20 tw:text-red-400 tw:text-xs tw:text-center">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="tw:w-full tw:h-12 tw:rounded-xl tw:bg-white tw:text-black hover:tw:bg-zinc-200 tw:font-semibold tw:transition-all tw:duration-200"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </Button>
        </form>

        <div className="tw:mt-8 tw:text-center tw:space-y-4">
          <p className="tw:text-sm tw:text-zinc-500">
            Don't have an account?{' '}
            <Link href="/signup" className="tw:text-white hover:tw:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
