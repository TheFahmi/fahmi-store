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
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <p className="text-sm font-medium text-primary mb-3">New collection</p>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-foreground leading-[1.05]">
            Shop smarter.
            <br />
            Live better.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
            Electronics, fashion, sports & more — curated for everyday excellence.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
            >
              Browse products
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-muted text-foreground text-sm font-medium hover:bg-muted/80"
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
                className="px-4 py-2 rounded-full bg-card border border-border text-sm text-foreground hover:border-primary/40 transition-colors"
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
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Featured</h2>
            <p className="text-sm text-muted-foreground mt-1">Hand-picked for you</p>
          </div>
          <Link href="/products" className="text-sm text-primary hover:underline">
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
          <div className="text-center py-16 text-muted-foreground">No products yet</div>
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
