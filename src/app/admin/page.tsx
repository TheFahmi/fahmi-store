'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api, formatIDR, statusColor, statusLabel, type OrderRow, type Product } from '@/lib/api';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;
    Promise.all([api.getAllOrders(), api.adminGetProducts()])
      .then(([o, p]) => {
        setOrders(Array.isArray(o) ? o : []);
        setProducts(Array.isArray(p) ? p : []);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : 'Failed to load'));
  }, [user]);

  if (loading || (user?.role === 'ADMIN' && orders.length === 0 && !err)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="h-9 w-56 rounded-lg bg-muted animate-pulse" />
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground">Admin access</h1>
        <p className="mt-2 text-muted-foreground text-[15px]">Sign in with an admin account.</p>
        <Link
          href="/login"
          className="inline-flex mt-6 h-11 px-6 items-center rounded-full bg-[#0071e3] text-white text-[15px] font-medium hover:bg-[#0077ed]"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground">Access denied</h1>
        <p className="mt-2 text-muted-foreground text-[15px]">You need admin privileges to view this page.</p>
        <Link href="/" className="inline-flex mt-6 h-11 px-6 items-center rounded-full bg-foreground text-background text-[15px] font-medium hover:opacity-90">
          Go home
        </Link>
      </div>
    );
  }

  const revenue = orders
    .filter((o) => ['confirmed', 'shipped', 'delivered'].includes(o.status))
    .reduce((s, o) => s + Number(o.subtotal || 0), 0);
  const pending = orders.filter((o) => ['unpaid', 'waiting_confirmation'].includes(o.status)).length;
  const recent = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

  const stats = [
    { label: 'Total orders', value: orders.length.toString(), sub: 'all time' },
    { label: 'Revenue', value: formatIDR(revenue), sub: 'confirmed+' },
    { label: 'Pending', value: pending.toString(), sub: 'awaiting payment' },
    { label: 'Products', value: products.length.toString(), sub: 'in catalog' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Admin dashboard</h1>
          <p className="text-[14px] text-muted-foreground mt-1">Welcome back, {user.username}.</p>
        </div>
        <span className="hidden sm:inline-flex text-[11px] font-semibold px-3 py-1 rounded-full bg-[#ff3b30] text-white">ADMIN</span>
      </div>

      {err && <div className="mt-6 p-4 rounded-2xl bg-card border border-destructive/30 text-destructive text-[14px]">{err}</div>}

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-card border border-border shadow-card">
            <p className="text-[12px] text-muted-foreground">{s.label}</p>
            <p className="text-[24px] sm:text-[28px] font-semibold text-foreground tracking-[-0.02em] mt-1">{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Link href="/admin/orders" className="lg:col-span-1 p-5 rounded-2xl bg-[#1d1d1f] text-white hover:shadow-card-hover transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-medium">Manage orders</span>
            <svg className="w-5 h-5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6" /></svg>
          </div>
          <p className="text-[12px] text-white/60 mt-1">Update status, view proofs, delete</p>
        </Link>
        <Link href="/admin/products" className="lg:col-span-1 p-5 rounded-2xl bg-[#0071e3] text-white hover:shadow-card-hover transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-medium">Manage products</span>
            <svg className="w-5 h-5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6" /></svg>
          </div>
          <p className="text-[12px] text-white/80 mt-1">Add, edit, delete catalog</p>
        </Link>
        <Link href="/admin/promos" className="lg:col-span-1 p-5 rounded-2xl bg-card border border-border hover:shadow-card-hover transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-medium text-foreground">Promo codes</span>
            <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6" /></svg>
          </div>
          <p className="text-[12px] text-muted-foreground mt-1">View active discounts</p>
        </Link>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-foreground">Recent orders</h2>
          <Link href="/admin/orders" className="text-[13px] text-[#0071e3] hover:underline">View all →</Link>
        </div>
        <div className="mt-4 rounded-2xl bg-card border border-border shadow-card overflow-hidden">
          {recent.length === 0 ? (
            <p className="p-6 text-[14px] text-muted-foreground text-center">No orders yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {recent.map((o) => {
                const sc = statusColor(o.status);
                return (
                  <div key={o.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-mono font-medium text-foreground truncate">{o.invoice}</p>
                      <p className="text-[12px] text-muted-foreground">{o.username} · {new Date(o.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: sc.bg, color: sc.fg }}>
                        {statusLabel(o.status)}
                      </span>
                      <span className="text-[14px] font-semibold text-foreground">{formatIDR(Number(o.subtotal))}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
