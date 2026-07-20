'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api, formatIDR, statusColor, statusLabel, type OrderRow } from '@/lib/api';

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!user?.username) {
      setOrders([]);
      return;
    }
    api
      .getAllOrders()
      .then((rows) => {
        const mine = (rows || []).filter((o) => o.username === user.username);
        mine.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setOrders(mine);
      })
      .catch((e) => {
        setErr(e instanceof Error ? e.message : 'Failed to load orders');
        setOrders([]);
      });
  }, [user?.username]);

  if (authLoading || (user && orders === null)) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="h-9 w-40 rounded-lg bg-muted animate-pulse" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M9 11H3v10h6V11zM21 3h-6v18h6V3zM15 7H9v4h6V7z" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Your orders</h1>
        <p className="mt-2 text-muted-foreground text-[15px]">Sign in to view your order history.</p>
        <Link
          href="/login"
          className="inline-flex mt-6 h-11 px-6 items-center rounded-full bg-[#0071e3] text-white text-[15px] font-medium hover:bg-[#0077ed]"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (err) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Your orders</h1>
        <div className="mt-8 p-6 rounded-2xl bg-card border border-border text-destructive text-[14px]">{err}</div>
      </div>
    );
  }

  if (orders && orders.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M9 11l3 3 8-8" /><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.66 0 3.22.45 4.56 1.24" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">No orders yet</h1>
        <p className="mt-2 text-muted-foreground text-[15px]">When you place an order, it will show up here.</p>
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Your orders</h1>
      <p className="text-[14px] text-muted-foreground mt-1">{orders?.length} {orders?.length === 1 ? 'order' : 'orders'}</p>

      <div className="mt-8 space-y-3">
        {orders?.map((o) => {
          const sc = statusColor(o.status);
          return (
            <Link
              key={o.id}
              href={`/orders/${o.invoice}`}
              className="block p-5 rounded-2xl bg-card border border-border hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-mono font-medium text-foreground">{o.invoice}</span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: sc.bg, color: sc.fg }}
                    >
                      {statusLabel(o.status)}
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    {new Date(o.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} · {o.totalquantity} items
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[16px] font-semibold text-foreground tracking-[-0.02em]">{formatIDR(Number(o.subtotal))}</p>
                  <p className="text-[12px] text-[#0071e3] mt-0.5">View details →</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
