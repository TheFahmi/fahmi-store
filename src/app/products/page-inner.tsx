'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, type Product, type Category } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

type Sort = 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'name';
type View = 'grid' | 'list';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get('cat');
  const qParam = searchParams.get('q');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [q, setQ] = useState(qParam || '');
  const [cat, setCat] = useState<string>(catParam || 'all');
  const [sort, setSort] = useState<Sort>('relevance');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [view, setView] = useState<View>('grid');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (catParam) setCat(catParam);
    if (qParam) setQ(qParam);
  }, [catParam, qParam]);

  useEffect(() => {
    Promise.all([api.getProducts(), api.getCategories().catch(() => [])])
      .then(([p, c]) => {
        setProducts(Array.isArray(p) ? p : []);
        setCategories(Array.isArray(c) ? c : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const matchQ =
        !q ||
        p.nama.toLowerCase().includes(q.toLowerCase()) ||
        (p.deskripsi || '').toLowerCase().includes(q.toLowerCase());
      const pCat = String(p.idcat ?? p.idcategory ?? '');
      const matchCat = cat === 'all' || pCat === cat;
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;
      const matchPrice = p.harga >= min && p.harga <= max;
      return matchQ && matchCat && matchPrice;
    });

    switch (sort) {
      case 'price-asc': list = [...list].sort((a, b) => a.harga - b.harga); break;
      case 'price-desc': list = [...list].sort((a, b) => b.harga - a.harga); break;
      case 'rating': list = [...list].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)); break;
      case 'name': list = [...list].sort((a, b) => a.nama.localeCompare(b.nama)); break;
    }
    return list;
  }, [products, q, cat, sort, minPrice, maxPrice]);

  const resetFilters = () => {
    setQ(''); setCat('all'); setSort('relevance'); setMinPrice(''); setMaxPrice('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Products</h1>
        <p className="text-muted-foreground mt-1 text-[14px]">Find exactly what you need</p>
      </div>

      {/* Search + category */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="w-full h-14 pl-12 pr-5 rounded-2xl bg-card border border-border text-[17px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3]"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="h-14 px-5 rounded-2xl bg-card border border-border text-[17px] text-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>{c.nama}</option>
          ))}
        </select>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="md:hidden h-14 px-5 rounded-2xl bg-card border border-border text-[15px] font-medium text-foreground flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Filters
        </button>
      </div>

      {/* Sort + view toggle + results count */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className="text-[13px] text-muted-foreground">
          {loading ? 'Loading…' : `${filtered.length} ${filtered.length === 1 ? 'product' : 'products'} found`}
        </p>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-10 pl-4 pr-9 rounded-full bg-card border border-border text-[13px] font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 appearance-none"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="name">Name: A–Z</option>
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>

          {/* View toggle */}
          <div className="hidden md:flex items-center gap-0.5 p-1 rounded-full bg-muted border border-border">
            <button
              onClick={() => setView('grid')}
              aria-label="Grid view"
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${view === 'grid' ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              onClick={() => setView('list')}
              aria-label="List view"
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${view === 'list' ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Sidebar filters (desktop) */}
        <aside className={`md:w-56 shrink-0 ${showFilters ? 'block' : 'hidden'} md:block`}>
          <div className="md:sticky md:top-20 space-y-5">
            <div className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-semibold text-foreground">Price range</h3>
                <button onClick={resetFilters} className="text-[12px] text-[#0071e3] hover:underline">Reset</button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-full h-9 px-2 rounded-lg bg-background border border-border text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                />
                <span className="text-muted-foreground text-[13px]">–</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-full h-9 px-2 rounded-lg bg-background border border-border text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                />
              </div>

              <h3 className="mt-5 mb-2 text-[13px] font-semibold text-foreground">Quick filters</h3>
              <div className="space-y-1.5">
                {[
                  { label: 'Under Rp200K', fn: () => { setMinPrice('0'); setMaxPrice('200000'); } },
                  { label: 'Rp200K–500K', fn: () => { setMinPrice('200000'); setMaxPrice('500000'); } },
                  { label: 'Rp500K–1M', fn: () => { setMinPrice('500000'); setMaxPrice('1000000'); } },
                  { label: 'Over Rp1M', fn: () => { setMinPrice('1000000'); setMaxPrice(''); } },
                ].map((f) => (
                  <button key={f.label} onClick={f.fn} className="block w-full text-left text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted px-2 py-1.5 rounded-lg transition-colors">
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border">
              <h3 className="text-[13px] font-semibold text-foreground mb-3">Categories</h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => setCat('all')}
                  className={`block w-full text-left text-[13px] px-2 py-1.5 rounded-lg transition-colors ${cat === 'all' ? 'bg-[#0071e3] text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                >
                  All categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCat(String(c.id))}
                    className={`block w-full text-left text-[13px] px-2 py-1.5 rounded-lg transition-colors ${cat === String(c.id) ? 'bg-[#0071e3] text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                  >
                    {c.nama}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`bg-muted animate-pulse rounded-2xl ${view === 'grid' ? 'aspect-[3/4]' : 'h-32'}`} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <h3 className="text-[17px] font-semibold text-foreground">No products found</h3>
              <p className="mt-1 text-[14px] text-muted-foreground">Try adjusting your filters or search.</p>
              <button onClick={resetFilters} className="mt-4 inline-flex h-10 px-5 items-center rounded-full bg-[#0071e3] text-white text-[14px] font-medium hover:bg-[#0077ed]">
                Clear filters
              </button>
            </div>
          ) : view === 'list' ? (
            <div className="space-y-3">
              {filtered.map((p) => (
                <ListItem key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ListItem({ product }: { product: Product }) {
  const idcat = product.idcat ?? product.idcategory;
  return (
    <a
      href={`/products/${product.id}`}
      className="group flex gap-4 p-3 rounded-2xl bg-card border border-border hover:shadow-card transition-shadow"
    >
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0" style={{ background: ['#1d1d1f', '#0a84ff', '#f59e0b', '#30d158', '#0071e3'][Number(idcat || 1) % 5] }}>
        <div className="w-full h-full flex items-center justify-center p-2">
          <span className="text-[11px] font-medium text-white text-center line-clamp-2">{product.nama}</span>
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {product.namacategory && (
            <span className="text-[11px] text-muted-foreground">{product.namacategory}</span>
          )}
          <h3 className="text-[15px] font-medium text-foreground line-clamp-2">{product.nama}</h3>
          <p className="text-[13px] text-muted-foreground line-clamp-2 mt-0.5">{product.deskripsi}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[15px] font-semibold text-foreground">Rp {product.harga.toLocaleString('id-ID')}</p>
          {product.rating != null && (
            <span className="text-[12px] text-muted-foreground">★ {Number(product.rating).toFixed(1)}</span>
          )}
        </div>
      </div>
    </a>
  );
}
