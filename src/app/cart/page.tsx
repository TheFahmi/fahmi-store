'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { formatIDR, productImage } from '@/lib/api';

export default function CartPage() {
  const { user } = useAuth();
  const { items, loading, setQty, remove } = useCart();

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Your cart</h1>
        <p className="mt-2 text-muted-foreground text-[15px]">Sign in to view your cart</p>
        <Link
          href="/login"
          className="inline-flex mt-6 h-11 px-6 items-center rounded-full bg-[#0071e3] text-white text-[15px] font-medium hover:bg-[#0077ed]"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const total = items.reduce((s, i) => s + Number(i.harga || 0) * Number(i.qty || 0), 0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Cart</h1>
      <p className="text-[13px] text-muted-foreground mt-1">{items.length} items</p>

      {loading ? (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-[15px]">Your cart is empty</p>
          <Link href="/products" className="inline-flex mt-4 text-[15px] text-[#0071e3] hover:underline">
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-2xl bg-card"
              >
                <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={productImage(item.image, item.nama)}
                    alt={item.nama}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-foreground truncate">{item.nama}</p>
                  <p className="text-[13px] text-muted-foreground mt-0.5">{formatIDR(Number(item.harga))}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-border">
                      <button
                        className="w-8 h-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setQty(item.id, Number(item.qty) - 1)}
                      >
                        &#8722;
                      </button>
                      <span className="w-8 text-center text-[13px] font-medium">{item.qty}</span>
                      <button
                        className="w-8 h-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setQty(item.id, Number(item.qty) + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => remove(item.id)}
                      className="text-[13px] text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-5 rounded-2xl bg-card">
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-muted-foreground">Subtotal</span>
              <span className="text-lg font-semibold text-foreground">{formatIDR(total)}</span>
            </div>
            <button className="mt-4 w-full h-11 rounded-full bg-[#0071e3] text-white text-[15px] font-medium hover:bg-[#0077ed]">
              Checkout
            </button>
            <p className="mt-2 text-[13px] text-center text-muted-foreground">Checkout flow uses existing backend order APIs</p>
          </div>
        </>
      )}
    </div>
  );
}
