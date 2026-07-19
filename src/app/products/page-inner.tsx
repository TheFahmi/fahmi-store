'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, type Product, type Category } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get('cat');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>(catParam || 'all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (catParam) setCat(catParam);
  }, [catParam]);

  useEffect(() => {
    Promise.all([api.getProducts(), api.getCategories().catch(() => [])])
      .then(([p, c]) => {
        setProducts(Array.isArray(p) ? p : []);
        setCategories(Array.isArray(c) ? c : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchQ =
        !q ||
        p.nama.toLowerCase().includes(q.toLowerCase()) ||
        (p.deskripsi || '').toLowerCase().includes(q.toLowerCase());
      const pCat = String(p.idcat ?? p.idcategory ?? '');
      const matchCat = cat === 'all' || pCat === cat;
      return matchQ && matchCat;
    });
  }, [products, q, cat]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Products</h1>
        <p className="text-muted-foreground mt-1 text-[13px]">Find what you need</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
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
            <option key={c.id} value={String(c.id)}>
              {c.nama}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-[15px]">No products found</div>
      ) : (
        <>
          <p className="text-[13px] text-muted-foreground mb-4">{filtered.length} products</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
