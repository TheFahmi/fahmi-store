'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { api, formatIDR, productImage } from '@/lib/api';

export default function WishlistPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.username) {
      setLoading(false);
      return;
    }
    api
      .getWishlist(user.username)
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user?.username]);

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Wishlist</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to see saved items</p>
        <Link href="/login" className="inline-flex mt-6 h-11 px-6 items-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Wishlist</h1>
      <p className="text-sm text-muted-foreground mt-1">Saved for later</p>

      {loading ? (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-16 text-center text-muted-foreground">
          No saved items
          <div>
            <Link href="/products" className="text-primary text-sm hover:underline">
              Browse products
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, idx) => (
            <Link
              key={item.id || idx}
              href={`/products/${item.idproduct || item.id}`}
              className="block bg-card rounded-2xl border border-border overflow-hidden"
            >
              <div className="aspect-square bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={productImage(item.image, item.nama)}
                  alt={item.nama || 'Item'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-foreground line-clamp-2">{item.nama || 'Product'}</p>
                {item.harga != null && (
                  <p className="mt-2 text-sm font-semibold">{formatIDR(Number(item.harga))}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
