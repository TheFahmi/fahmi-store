'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { api, type Product } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

type WishItem = {
  id?: number;
  idproduct?: number;
  nama?: string;
  harga?: number;
  image?: string | null;
  deskripsi?: string;
  stok?: number;
  rating?: number;
  idcat?: number;
  idcategory?: number;
  namacategory?: string;
};

export default function WishlistPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.username) {
      setLoading(false);
      return;
    }
    api
      .getWishlist(user.username)
      .then(async (d) => {
        const raw = Array.isArray(d) ? (d as WishItem[]) : [];
        // Enrich with product info where missing
        if (raw.length > 0 && !raw[0].nama) {
          try {
            const all = await api.getProducts();
            const map = new Map(all.map((p: Product) => [p.id, p]));
            setItems(raw.map((r) => {
              const p = map.get(r.idproduct || r.id || 0);
              return p ? { ...p, ...r } : r;
            }));
            return;
          } catch {}
        }
        setItems(raw);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user?.username]);

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M12 21s-7.5-4.6-10-9.3C.5 8.5 2 5 5.3 5c1.9 0 3.6 1 4.7 2.6C11.1 6 12.8 5 14.7 5 18 5 19.5 8.5 22 11.7 19.5 16.4 12 21 12 21z" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Your wishlist</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">Sign in to save and view your favorite items</p>
        <Link href="/login" className="inline-flex mt-6 h-11 px-6 items-center rounded-full bg-[#0071e3] text-white text-[15px] font-medium hover:bg-[#0077ed]">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Wishlist</h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            {loading ? 'Loading…' : `${items.length} ${items.length === 1 ? 'item' : 'items'} saved`}
          </p>
        </div>
        <Link href="/products" className="text-[14px] text-[#0071e3] hover:underline">Browse more</Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-5">
            <svg className="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M12 21s-7.5-4.6-10-9.3C.5 8.5 2 5 5.3 5c1.9 0 3.6 1 4.7 2.6C11.1 6 12.8 5 14.7 5 18 5 19.5 8.5 22 11.7 19.5 16.4 12 21 12 21z" />
            </svg>
          </div>
          <h3 className="text-[17px] font-semibold text-foreground">No saved items yet</h3>
          <p className="mt-1 text-[14px] text-muted-foreground">Tap the heart on any product to save it here.</p>
          <Link href="/products" className="mt-4 inline-flex h-10 px-5 items-center rounded-full bg-[#0071e3] text-white text-[14px] font-medium hover:bg-[#0077ed]">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, idx) => (
            <ProductCard
              key={item.id || idx}
              product={{
                id: item.idproduct || item.id || idx,
                nama: item.nama || 'Product',
                harga: Number(item.harga || 0),
                image: item.image ?? null,
                deskripsi: item.deskripsi || '',
                stok: Number(item.stok || 0),
                rating: Number(item.rating || 0),
                idcat: item.idcat,
                idcategory: item.idcategory,
                namacategory: item.namacategory,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
