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
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Wishlist</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">Sign in to see saved items</p>
        <Link href="/login" className="inline-flex mt-6 h-11 px-6 items-center rounded-full bg-[#0071e3] text-white text-[15px] font-medium hover:bg-[#0077ed]">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Wishlist</h1>
      <p className="text-[13px] text-muted-foreground mt-1">Saved for later</p>

      {loading ? (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-[15px]">No saved items</p>
          <Link href="/products" className="text-[#0071e3] text-[15px] mt-4 inline-block hover:underline">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, idx) => (
            <Link
              key={item.id || idx}
              href={`/products/${item.idproduct || item.id}`}
              className="group block bg-card rounded-2xl overflow-hidden transition-shadow duration-500 group-hover:shadow-md"
            >
              <div className="aspect-[3/4] bg-muted overflow-hidden rounded-t-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={productImage(item.image, item.nama)}
                  alt={item.nama || 'Item'}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <p className="text-[15px] font-medium text-foreground line-clamp-2">{item.nama || 'Product'}</p>
                {item.harga != null && (
                  <p className="mt-2 text-[15px] font-semibold text-foreground">{formatIDR(Number(item.harga))}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
