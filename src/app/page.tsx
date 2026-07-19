'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, formatIDR, type Product, type Category } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

const CAT_META: Record<string, { bg: string; fg: string; blurb: string }> = {
  Electronics: { bg: '#1d1d1f', fg: '#f5f5f7', blurb: 'Tech that moves you forward' },
  Fashion: { bg: '#0a84ff', fg: '#ffffff', blurb: 'Wear your confidence' },
  'Home & Living': { bg: '#f59e0b', fg: '#1d1d1f', blurb: 'Make space for comfort' },
  Sports: { bg: '#30d158', fg: '#1d1d1f', blurb: 'Train. Play. Win.' },
  Books: { bg: '#0071e3', fg: '#ffffff', blurb: 'Stories worth your time' },
};

const TRUST = [
  {
    title: 'Free Shipping',
    sub: 'On orders over Rp500K',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M3 7h11v10H3z" /><path d="M14 10h4l3 3v4h-7" /><circle cx="7" cy="18" r="1.5" /><circle cx="17" cy="18" r="1.5" />
      </svg>
    ),
  },
  {
    title: 'Secure Payment',
    sub: '256-bit encryption',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z" /><path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Easy Returns',
    sub: '30-day money back',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M3 12a9 9 0 109-9" /><path d="M3 4v4h4" />
      </svg>
    ),
  },
  {
    title: '24/7 Support',
    sub: 'Always here to help',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path d="M12 8v4l2 2" />
      </svg>
    ),
  },
];

const STATS = [
  { value: '10K+', label: 'Customers' },
  { value: '500+', label: 'Products' },
  { value: '4.9', label: 'Avg rating' },
  { value: '99%', label: 'Satisfaction' },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getHomeProducts().catch(() => api.getProducts()), api.getCategories().catch(() => [])])
      .then(([p, c]) => {
        setProducts(Array.isArray(p) ? p : []);
        setCategories(Array.isArray(c) ? c : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const featured = products.slice(0, 8);
  const bestSellers = [...products].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)).slice(0, 6);

  return (
    <div>
      {/* HERO — full-width carousel banner */}
      <section className="bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 lg:py-28">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1 rounded-full bg-background/10 text-background/80 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#30d158]" />
                New season, new arrivals
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.05]">
                Premium products.<br />Honest prices.
              </h1>
              <p className="mt-5 text-lg text-background/70 max-w-md">
                Electronics, fashion, sports &amp; more — curated for everyday excellence, delivered fast to your door.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-[#0071e3] text-background text-[15px] font-medium hover:bg-[#0077ed] transition-colors"
                >
                  Shop now
                </Link>
                <Link
                  href="/products?cat=1"
                  className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-background/10 text-background text-[15px] font-medium hover:bg-background/20 transition-colors"
                >
                  Browse electronics
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6">
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5].map((i) => (
                    <svg key={i} className="w-4 h-4 text-[#f59e0b]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9L10 15.9 4.8 18.8l1-5.9L1.5 8.6l5.9-.9L10 1.5z" />
                    </svg>
                  ))}
                  <span className="text-[13px] text-background/70 ml-1">4.9 (2.3K reviews)</span>
                </div>
              </div>
            </div>

            {/* Product preview stack — inline SVG */}
            <div className="grid grid-cols-2 gap-3">
              {featured.slice(0, 4).map((p, i) => {
                const colors = ['#1d1d1f', '#0a84ff', '#f59e0b', '#30d158'];
                const bg = colors[i % 4];
                return (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className={`group block rounded-2xl overflow-hidden border border-background/10 ${i % 2 === 0 ? 'translate-y-0' : 'translate-y-6'}`}
                  >
                    <div
                      className="aspect-square flex flex-col items-center justify-center p-5 text-center"
                      style={{ background: bg }}
                    >
                      <p className="text-[13px] font-medium text-background line-clamp-2">{p.nama}</p>
                      <p className="mt-2 text-[11px] text-background/70">{formatIDR(p.harga)}</p>
                    </div>
                  </Link>
                );
              })}
              {featured.length === 0 && !loading && (
                <div className="col-span-2 aspect-[4/3] rounded-2xl bg-background/5 flex items-center justify-center text-background/40 text-[14px]">
                  Loading store…
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="border-b border-black/5 dark:border-background/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST.map((t) => (
              <div key={t.title} className="flex items-center gap-3">
                <span className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 dark:bg-background/10 text-[#0071e3]">
                  {t.icon}
                </span>
                <div>
                  <p className="text-[14px] font-medium text-foreground">{t.title}</p>
                  <p className="text-[12px] text-muted-foreground">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORY SHOWCASE */}
      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Shop by category</h2>
              <p className="text-[14px] text-muted-foreground mt-1">Find exactly what you need</p>
            </div>
            <Link href="/products" className="text-[14px] text-[#0071e3] hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map((c, i) => {
              const meta = CAT_META[c.nama] || { bg: '#1d1d1f', fg: '#ffffff', blurb: 'Explore the collection' };
              return (
                <Link
                  key={c.id}
                  href={`/products?cat=${c.id}`}
                  className={`group relative rounded-2xl overflow-hidden p-5 ${i === 0 ? 'lg:col-span-1' : ''}`}
                  style={{ background: meta.bg, color: meta.fg, minHeight: '160px' }}
                >
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <p className="text-[11px] font-medium opacity-70 uppercase tracking-wider">Category</p>
                      <h3 className="mt-1 text-[20px] font-semibold tracking-[-0.02em] leading-tight">{c.nama}</h3>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[13px] opacity-80">{meta.blurb}</span>
                      <span className="w-7 h-7 rounded-full flex items-center justify-center bg-black/10 group-hover:translate-x-1 transition-transform" style={{ background: meta.fg === '#ffffff' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }}>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                          <path d="M5 12h14M13 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Featured</h2>
            <p className="text-[14px] text-muted-foreground mt-1">Hand-picked for you</p>
          </div>
          <Link href="/products" className="text-[14px] text-[#0071e3] hover:underline">See all</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-[15px]">No products yet</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* PROMO BANNER — solid color */}
      <section className="bg-[#0071e3] text-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wider text-background/70 mb-2">Limited time offer</p>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] leading-tight">
                Save 10% on your first order
              </h2>
              <p className="mt-3 text-background/80 text-[15px] max-w-md">
                Use code <span className="font-semibold text-background">FAHMI10</span> at checkout. Valid for new customers only.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-white text-[#0071e3] text-[15px] font-semibold hover:bg-white/90 transition-colors shrink-0"
            >
              Shop the sale
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* BEST SELLERS — horizontal scroll */}
      {bestSellers.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Top rated</h2>
              <p className="text-[14px] text-muted-foreground mt-1">Customer favorites this week</p>
            </div>
            <Link href="/products" className="text-[14px] text-[#0071e3] hover:underline shrink-0">See all</Link>
          </div>
          <div className="scroll-row no-scrollbar flex gap-4 overflow-x-auto -mx-4 px-4 pb-2">
            {bestSellers.map((p) => (
              <div key={p.id} className="w-[240px] sm:w-[280px] shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* STATS */}
      <section className="border-y border-black/5 dark:border-background/10 bg-muted/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">{s.value}</p>
                <p className="mt-1 text-[13px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-foreground text-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em]">Stay in the loop</h2>
            <p className="mt-3 text-background/70 text-[15px]">
              Subscribe for exclusive deals, new arrivals, and member-only offers.
            </p>
            <form className="mt-6 flex flex-col sm:flex-row gap-2 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-14 px-5 rounded-full bg-background text-foreground text-[17px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3] border-2 border-background"
              />
              <button
                type="submit"
                className="h-14 px-7 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-[17px] font-medium transition-colors"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-3 text-[12px] text-background/50">We respect your privacy. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
