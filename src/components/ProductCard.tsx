'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatIDR, productImage, type Product } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { api } from '@/lib/api';

function Stars({ rating }: { rating: number }) {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${r.toFixed(1)} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`w-3 h-3 ${i <= Math.round(r) ? 'text-[#f59e0b]' : 'text-muted-foreground/40'}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9L10 15.9 4.8 18.8l1-5.9L1.5 8.6l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const { add } = useCart();
  const [busy, setBusy] = useState(false);
  const [wish, setWish] = useState(false);
  const [err, setErr] = useState('');

  const idcat = product.idcat ?? product.idcategory;
  const catName = product.namacategory;
  const discount = product.harga > 500000 ? Math.round(product.harga * 0.1) : 0;
  const originalPrice = discount ? product.harga + discount : 0;
  const soldOut = (product.stok || 0) <= 0;

  const toggleWish = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    setWish((w) => !w);
    try {
      if (!wish) {
        await api.addWishlist({ username: user.username, idproduct: product.id });
      }
    } catch {}
  };

  const quickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      setErr('Login required');
      return;
    }
    setBusy(true);
    setErr('');
    try {
      await add(product, 1);
    } catch (e: any) {
      setErr(e?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative block bg-card rounded-2xl overflow-hidden shadow-card transition-shadow duration-500 hover:shadow-card-hover"
    >
      <div className="aspect-[3/4] bg-muted relative overflow-hidden rounded-t-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={productImage(product.image, product.nama, idcat)}
          alt={product.nama}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
        />

        {/* Category badge (top-left) */}
        {catName && (
          <span className="absolute top-3 left-3 text-[11px] font-medium bg-white/90 dark:bg-black/70 text-foreground px-2.5 py-1 rounded-full backdrop-blur-sm">
            {catName}
          </span>
        )}

        {/* Wishlist heart (top-right) */}
        <button
          onClick={toggleWish}
          aria-label="Toggle wishlist"
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-sm text-foreground hover:bg-white dark:hover:bg-black/80 transition-colors"
        >
          <svg className={`w-4 h-4 ${wish ? 'text-destructive' : 'text-foreground'}`} viewBox="0 0 24 24" fill={wish ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
            <path d="M12 21s-7.5-4.6-10-9.3C.5 8.5 2 5 5.3 5c1.9 0 3.6 1 4.7 2.6C11.1 6 12.8 5 14.7 5 18 5 19.5 8.5 22 11.7 19.5 16.4 12 21 12 21z" />
          </svg>
        </button>

        {/* Discount badge */}
        {discount > 0 && !soldOut && (
          <span className="absolute bottom-3 left-3 text-[11px] font-semibold bg-[#ff3b30] text-white px-2 py-1 rounded-full">
            -10%
          </span>
        )}

        {/* Sold out */}
        {soldOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-[13px] font-medium bg-white text-foreground px-3 py-1.5 rounded-full">Sold out</span>
          </div>
        )}

        {/* Quick add button (appears on hover) */}
        {!soldOut && (
          <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={quickAdd}
              disabled={busy}
              className="w-full h-10 rounded-full bg-[#0071e3] text-white text-[13px] font-medium hover:bg-[#0077ed] disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {busy ? (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M6 6h15l-1.5 9h-12z" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /><path d="M6 6L5 3H2" />
                  </svg>
                  Quick add
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-[15px] font-medium text-foreground leading-snug line-clamp-2">
          {product.nama}
        </h3>
        <div className="mt-1.5 flex items-center gap-2">
          <Stars rating={product.rating || 0} />
          {product.rating != null && (
            <span className="text-[11px] text-muted-foreground">{Number(product.rating).toFixed(1)}</span>
          )}
        </div>
        <div className="mt-2 flex flex-col">
          <p className="text-[15px] font-semibold text-foreground tracking-[-0.01em] truncate">{formatIDR(product.harga)}</p>
          {originalPrice > 0 && (
            <p className="text-[12px] text-muted-foreground line-through truncate">{formatIDR(originalPrice)}</p>
          )}
        </div>
        {err && <p className="mt-1 text-[11px] text-destructive">{err}</p>}
      </div>
    </Link>
  );
}
