'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type Product, type Category } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getHomeProducts().catch(() => api.getProducts()), api.getCategories().catch(() => [])])
      .then(([p, c]) => {
        setProducts(Array.isArray(p) ? p.slice(0, 8) : []);
        setCategories(Array.isArray(c) ? c : []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="pt-24 pb-20 lg:pt-36 lg:pb-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.03em] leading-[1.05] text-foreground">
            Shop smarter.<br />Live better.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
            Electronics, fashion, sports &amp; more — curated for everyday excellence.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-[#0071e3] text-white text-[15px] font-medium hover:bg-[#0077ed]"
            >
              Browse products
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-black/5 dark:bg-white/10 text-foreground text-[15px] font-medium hover:bg-black/10 dark:hover:bg-white/15"
            >
              View all
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?cat=${c.id}`}
                className="px-4 py-2 rounded-full bg-card text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                {c.nama}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Featured</h2>
            <p className="text-[13px] text-muted-foreground mt-1">Hand-picked for you</p>
          </div>
          <Link href="/products" className="text-[15px] text-[#0071e3] hover:underline">
            See all
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-[15px]">No products yet</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
