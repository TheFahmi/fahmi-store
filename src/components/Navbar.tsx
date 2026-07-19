'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { useTheme } from '@/lib/theme';
import { api, type Category } from '@/lib/api';

const CAT_META: Record<string, { bg: string; fg: string }> = {
  Electronics: { bg: '#1d1d1f', fg: '#f5f5f7' },
  Fashion: { bg: '#0a84ff', fg: '#ffffff' },
  'Home & Living': { bg: '#f59e0b', fg: '#1d1d1f' },
  Sports: { bg: '#30d158', fg: '#1d1d1f' },
  Books: { bg: '#0071e3', fg: '#ffffff' },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [q, setQ] = useState('');
  const [cats, setCats] = useState<Category[]>([]);

  useEffect(() => {
    api.getCategories().then((c) => setCats(Array.isArray(c) ? c : [])).catch(() => {});
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/products?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/10">
      {/* Top bar — announcements */}
      <div className="bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-8 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
            <span className="whitespace-nowrap">Free shipping over Rp 500.000</span>
            <span className="hidden sm:inline text-white/40">•</span>
            <span className="hidden sm:inline whitespace-nowrap">30-day returns</span>
            <span className="hidden md:inline text-white/40">•</span>
            <span className="hidden md:inline whitespace-nowrap">24/7 support</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/products" className="hidden sm:inline hover:text-white/80 whitespace-nowrap">Track order</Link>
            <span className="text-white/40">|</span>
            <button onClick={toggle} className="hover:text-white/80 whitespace-nowrap">
              {theme === 'dark' ? 'Light' : 'Dark'} mode
            </button>
          </div>
        </div>
      </div>

      {/* Main nav row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="w-8 h-8 rounded-xl bg-[#0071e3] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path d="M6 6h15l-1.5 9h-12z" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /><path d="M6 6L5 3H2" />
              </svg>
            </span>
            <span className="text-[18px] font-semibold tracking-[-0.02em] text-foreground">Fahmi Store</span>
          </Link>

          {/* Search (desktop) — prominent center */}
          <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-xl relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for products, brands, categories..."
              className="w-full h-11 pl-11 pr-24 rounded-full bg-black/5 dark:bg-white/10 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:bg-white dark:focus:bg-black/40 transition"
            />
            <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-4 rounded-full bg-[#0071e3] text-white text-[13px] font-medium hover:bg-[#0077ed]">
              Search
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Link
              href="/wishlist"
              className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground"
              aria-label="Wishlist"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M12 21s-7.5-4.6-10-9.3C.5 8.5 2 5 5.3 5c1.9 0 3.6 1 4.7 2.6C11.1 6 12.8 5 14.7 5 18 5 19.5 8.5 22 11.7 19.5 16.4 12 21 12 21z" />
              </svg>
            </Link>

            <Link
              href="/cart"
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground"
              aria-label="Cart"
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path d="M6 6h15l-1.5 9h-12z" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /><path d="M6 6L5 3H2" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0071e3] text-white text-[10px] font-semibold flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden sm:flex items-center gap-2 ml-1">
                <Link href="/cart" className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                  <span className="w-7 h-7 rounded-full bg-[#0071e3] text-white text-[12px] font-semibold flex items-center justify-center">
                    {user.username.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="text-[13px] font-medium text-foreground max-w-[100px] truncate">{user.username}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-[13px] text-muted-foreground hover:text-destructive px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex ml-1 text-[13px] font-medium text-white bg-[#0071e3] px-4 py-2 rounded-full hover:bg-[#0077ed]"
              >
                Sign in
              </Link>
            )}

            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                {open ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Category nav row (desktop) */}
        <nav className="hidden md:flex items-center gap-1 h-11 border-t border-black/5 dark:border-white/10">
          <div
            onMouseEnter={() => setMega(true)}
            onMouseLeave={() => setMega(false)}
            className="relative h-full flex items-center"
          >
            <button className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-foreground hover:text-[#0071e3] transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              All Categories
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {mega && cats.length > 0 && (
              <div className="absolute top-full left-0 pt-1 w-72 z-50">
                <div className="bg-card rounded-2xl shadow-lg p-2 border border-border">
                  {cats.map((c) => {
                    const meta = CAT_META[c.nama] || { bg: '#1d1d1f', fg: '#ffffff' };
                    return (
                      <Link
                        key={c.id}
                        href={`/products?cat=${c.id}`}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors"
                      >
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-semibold" style={{ background: meta.bg, color: meta.fg }}>
                          {c.nama.slice(0, 1)}
                        </span>
                        <div className="flex-1">
                          <p className="text-[13px] font-medium text-foreground">{c.nama}</p>
                          <p className="text-[11px] text-muted-foreground">Browse {c.nama.toLowerCase()}</p>
                        </div>
                        <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {[
            { href: '/products', label: 'Shop All' },
            { href: '/products?cat=1', label: 'Electronics' },
            { href: '/products?cat=2', label: 'Fashion' },
            { href: '/products?cat=3', label: 'Home & Living' },
            { href: '/products?cat=4', label: 'Sports' },
            { href: '/products?cat=5', label: 'Books' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 text-[13px] font-medium rounded-full transition-colors ${
                isActive(l.href.split('?')[0])
                  ? 'text-[#0071e3]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/products" className="ml-auto px-3 py-2 text-[13px] font-medium text-[#ff3b30] hover:text-[#ff453a]">
            Sale
          </Link>
        </nav>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-black/5 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
            <form onSubmit={onSearch} className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="w-full h-11 pl-10 pr-4 rounded-full bg-black/5 dark:bg-white/10 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
              />
            </form>

            <div className="grid grid-cols-2 gap-2">
              {[
                { href: '/products', label: 'Shop All' },
                { href: '/products?cat=1', label: 'Electronics' },
                { href: '/products?cat=2', label: 'Fashion' },
                { href: '/products?cat=3', label: 'Home & Living' },
                { href: '/products?cat=4', label: 'Sports' },
                { href: '/products?cat=5', label: 'Books' },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 text-[14px] font-medium rounded-xl bg-black/5 dark:bg-white/10 text-foreground text-center"
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/10">
              <Link href="/wishlist" onClick={() => setOpen(false)} className="text-[14px] font-medium text-foreground">Wishlist</Link>
              <Link href="/cart" onClick={() => setOpen(false)} className="text-[14px] font-medium text-foreground">Cart ({count})</Link>
              {user ? (
                <button onClick={() => { logout(); setOpen(false); }} className="text-[14px] font-medium text-destructive">Sign out</button>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)} className="text-[14px] font-medium text-[#0071e3]">Sign in</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
