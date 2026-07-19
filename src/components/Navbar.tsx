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

  const links = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Shop' },
    { href: '/wishlist', label: 'Wishlist' },
  ];

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="w-7 h-7 rounded-lg bg-[#0071e3] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path d="M6 6h15l-1.5 9h-12z" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /><path d="M6 6L5 3H2" />
              </svg>
            </span>
            <span className="text-[17px] font-semibold tracking-[-0.02em] text-foreground">Fahmi Store</span>
          </Link>

          {/* Search (desktop) */}
          <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-md relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="w-full h-9 pl-10 pr-4 rounded-full bg-black/5 dark:bg-white/10 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:bg-white dark:focus:bg-black/40"
            />
          </form>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <div
              onMouseEnter={() => setMega(true)}
              onMouseLeave={() => setMega(false)}
              className="relative"
            >
              <button
                className="flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                Categories
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {mega && cats.length > 0 && (
                <div className="absolute top-full right-0 pt-2 w-64">
                  <div className="bg-card rounded-2xl shadow-card-hover p-2 border border-border">
                    {cats.map((c) => {
                      const meta = CAT_META[c.nama] || { bg: '#1d1d1f', fg: '#ffffff' };
                      return (
                        <Link
                          key={c.id}
                          href={`/products?cat=${c.id}`}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted transition-colors"
                        >
                          <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-semibold" style={{ background: meta.bg, color: meta.fg }}>
                            {c.nama.slice(0, 1)}
                          </span>
                          <span className="text-[13px] text-foreground">{c.nama}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 text-[13px] font-medium rounded-full transition-colors ${
                  isActive(l.href)
                    ? 'text-foreground bg-black/5 dark:bg-white/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggle}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>

            <Link
              href="/cart"
              className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground"
              aria-label="Cart"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path d="M6 6h15l-1.5 9h-12z" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /><path d="M6 6L5 3H2" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#0071e3] text-white text-[10px] font-semibold flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden sm:flex items-center gap-2 ml-1">
                <span className="text-[13px] text-muted-foreground max-w-[100px] truncate">{user.username}</span>
                <button
                  onClick={logout}
                  className="text-[13px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex ml-1 text-[13px] font-medium text-white bg-[#0071e3] px-3.5 py-1.5 rounded-full hover:bg-[#0077ed]"
              >
                Sign in
              </Link>
            )}

            <button
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                {open ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-3 border-t border-black/5 dark:border-white/10 pt-3 space-y-2">
            <form onSubmit={onSearch} className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="w-full h-10 pl-10 pr-4 rounded-full bg-black/5 dark:bg-white/10 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
              />
            </form>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 text-[14px] font-medium rounded-lg ${
                  isActive(l.href) ? 'text-foreground bg-black/5 dark:bg-white/10' : 'text-muted-foreground'
                }`}
              >
                {l.label}
              </Link>
            ))}
            {cats.length > 0 && (
              <div className="px-3 pt-1 pb-2">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Categories</p>
                <div className="flex flex-wrap gap-1.5">
                  {cats.map((c) => (
                    <Link
                      key={c.id}
                      href={`/products?cat=${c.id}`}
                      onClick={() => setOpen(false)}
                      className="px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[12px] text-foreground"
                    >
                      {c.nama}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {user ? (
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="block w-full text-left px-3 py-2 text-[14px] font-medium text-muted-foreground"
              >
                Sign out ({user.username})
              </button>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="block px-3 py-2 text-[14px] font-medium text-[#0071e3]">
                Sign in
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
