'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 010-4.2V7.06H2.18a11 11 0 000 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.8 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.04zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password);
      router.push('/');
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] grid lg:grid-cols-2">
      {/* Brand hero (left) */}
      <div className="hidden lg:flex flex-col justify-between bg-foreground text-background p-12">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#0071e3] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <path d="M6 6h15l-1.5 9h-12z" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /><path d="M6 6L5 3H2" />
            </svg>
          </span>
          <span className="text-[17px] font-semibold tracking-[-0.02em]">Fahmi Store</span>
        </Link>

        <div>
          <h2 className="text-4xl xl:text-5xl font-semibold tracking-[-0.03em] leading-[1.1]">
            Welcome back.<br />Shop the best.
          </h2>
          <p className="mt-5 text-white/70 text-[16px] max-w-md">
            Premium products, fast delivery, and member-only deals. Sign in to pick up where you left off.
          </p>
          <div className="mt-8 flex items-center gap-6">
            <div>
              <p className="text-2xl font-semibold">10K+</p>
              <p className="text-[12px] text-white/60">Happy customers</p>
            </div>
            <div className="w-px h-10 bg-white/15" />
            <div>
              <p className="text-2xl font-semibold">4.9</p>
              <p className="text-[12px] text-white/60">Average rating</p>
            </div>
            <div className="w-px h-10 bg-white/15" />
            <div>
              <p className="text-2xl font-semibold">500+</p>
              <p className="text-[12px] text-white/60">Products</p>
            </div>
          </div>
        </div>

        <p className="text-[12px] text-white/40">&copy; {new Date().getFullYear()} Fahmi Store. Crafted with care.</p>
      </div>

      {/* Form (right) */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Sign in</h1>
            <p className="mt-2 text-[15px] text-muted-foreground">Welcome back to Fahmi Store</p>
          </div>

          <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-card border border-border">
            {/* Social */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setError('Social login is not available in this demo')}
                className="h-11 rounded-full border border-border bg-background flex items-center justify-center gap-2 text-[14px] font-medium text-foreground hover:bg-muted transition-colors"
              >
                <GoogleIcon /> Google
              </button>
              <button
                type="button"
                onClick={() => setError('Social login is not available in this demo')}
                className="h-11 rounded-full border border-border bg-background flex items-center justify-center gap-2 text-[14px] font-medium text-foreground hover:bg-muted transition-colors"
              >
                <AppleIcon /> Apple
              </button>
            </div>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[12px] text-muted-foreground">or continue with email</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1.5">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-background border border-border text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3]"
                  autoComplete="username"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-background border border-border text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3]"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-[#0071e3] focus:ring-[#0071e3]/30"
                  />
                  <span className="text-[13px] text-muted-foreground">Remember me</span>
                </label>
                <button type="button" className="text-[13px] text-[#0071e3] hover:underline">Forgot password?</button>
              </div>

              {error && <p className="text-[13px] text-destructive">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-full bg-[#0071e3] text-white text-[15px] font-medium hover:bg-[#0077ed] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-[15px] text-muted-foreground">
            No account?{' '}
            <Link href="/register" className="text-[#0071e3] hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
