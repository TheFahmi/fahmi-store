'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { formatIDR, productImage } from '@/lib/api';

export default function CartPage() {
  const { user } = useAuth();
  const { items, loading, setQty, remove } = useCart();
  const [promo, setPromo] = useState('');
  const [applied, setApplied] = useState(false);

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M6 6h15l-1.5 9h-12z" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /><path d="M6 6L5 3H2" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Your cart</h1>
        <p className="mt-2 text-muted-foreground text-[15px]">Sign in to view your cart and checkout</p>
        <Link
          href="/login"
          className="inline-flex mt-6 h-11 px-6 items-center rounded-full bg-[#0071e3] text-white text-[15px] font-medium hover:bg-[#0077ed]"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((s, i) => s + Number(i.harga || 0) * Number(i.kuantiti || i.qty || 0), 0);
  const shipping = subtotal > 500000 || subtotal === 0 ? 0 : 25000;
  const discount = applied ? Math.round(subtotal * 0.1) : 0;
  const tax = Math.round((subtotal - discount) * 0.11);
  const total = subtotal - discount + shipping + tax;

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promo.trim().toUpperCase() === 'FAHMI10') setApplied(true);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Cart</h1>
        <div className="mt-8 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M6 6h15l-1.5 9h-12z" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /><path d="M6 6L5 3H2" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground text-[15px]">Looks like you haven't added anything yet.</p>
        <Link
          href="/products"
          className="inline-flex mt-6 h-11 px-6 items-center rounded-full bg-[#0071e3] text-white text-[15px] font-medium hover:bg-[#0077ed]"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Shopping cart</h1>
      <p className="text-[14px] text-muted-foreground mt-1">{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>

      <div className="mt-8 grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const qty = Number(item.kuantiti || item.qty || 0);
            const nama = item.Nama_product || item.nama || 'Product';
            return (
            <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-card border border-border">
              <Link href={`/products/${item.idproduct || item.id}`} className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-muted overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={productImage(item.image, nama)}
                  alt={nama}
                  className="w-full h-full object-cover"
                />
              </Link>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <Link href={`/products/${item.idproduct || item.id}`} className="text-[15px] font-medium text-foreground hover:text-[#0071e3] line-clamp-2">
                    {nama}
                  </Link>
                  <p className="text-[13px] text-muted-foreground mt-0.5">{formatIDR(Number(item.harga))} each</p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-border">
                    <button
                      className="w-8 h-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setQty(item.id, qty - 1)}
                      aria-label="Decrease"
                    >&#8722;</button>
                    <span className="w-8 text-center text-[13px] font-medium">{qty}</span>
                    <button
                      className="w-8 h-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setQty(item.id, qty + 1)}
                      aria-label="Increase"
                    >+</button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[15px] font-semibold text-foreground">{formatIDR(Number(item.harga) * qty)}</span>
                    <button
                      onClick={() => remove(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            );
          })}

          <Link href="/products" className="inline-flex items-center gap-1.5 text-[14px] text-[#0071e3] hover:underline mt-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Continue shopping
          </Link>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 p-6 rounded-2xl bg-card border border-border shadow-card">
            <h2 className="text-[17px] font-semibold text-foreground">Order summary</h2>

            {/* Promo */}
            <form onSubmit={applyPromo} className="mt-4 flex gap-2">
              <input
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="Promo code"
                className="flex-1 h-10 px-3 rounded-lg bg-background border border-border text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
              />
              <button
                type="submit"
                className="h-10 px-4 rounded-lg bg-foreground text-background text-[14px] font-medium hover:opacity-90"
              >
                Apply
              </button>
            </form>
            {applied && (
              <p className="mt-2 text-[12px] text-success flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9L10 15.9 4.8 18.8l1-5.9L1.5 8.6l5.9-.9L10 1.5z" /></svg>
                Code FAHMI10 applied — 10% off
              </p>
            )}

            <dl className="mt-5 space-y-2.5 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="text-foreground">{formatIDR(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-success">Discount</dt>
                  <dd className="text-success">−{formatIDR(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="text-foreground">{shipping === 0 ? 'Free' : formatIDR(shipping)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax (11%)</dt>
                <dd className="text-foreground">{formatIDR(tax)}</dd>
              </div>
            </dl>

            <div className="mt-4 pt-4 border-t border-border flex justify-between items-baseline">
              <span className="text-[15px] font-medium text-foreground">Total</span>
              <span className="text-2xl font-semibold text-foreground tracking-[-0.02em]">{formatIDR(total)}</span>
            </div>

            <button className="mt-5 w-full h-11 rounded-full bg-[#0071e3] text-white text-[15px] font-medium hover:bg-[#0077ed] transition-colors">
              Proceed to checkout
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-muted-foreground">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z" />
              </svg>
              Secure checkout · Free returns within 30 days
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
