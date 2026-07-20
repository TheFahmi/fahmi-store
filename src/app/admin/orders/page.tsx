'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth';
import {
  api,
  formatIDR,
  statusColor,
  statusLabel,
  type Confirmation,
  type OrderRow,
  ORDER_STATUS,
} from '@/lib/api';

export default function AdminOrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [confirms, setConfirms] = useState<Confirmation[]>([]);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [viewProof, setViewProof] = useState<Confirmation | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = () => {
    api.getAllOrders().then((o) => setOrders(Array.isArray(o) ? o : [])).catch((e) => {
      setErr(e instanceof Error ? e.message : 'Failed');
      setOrders([]);
    });
    api.getConfirmations().then((c) => setConfirms(Array.isArray(c) ? c : [])).catch(() => setConfirms([]));
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') load();
  }, [user]);

  const filtered = useMemo(() => {
    if (!orders) return [];
    const list = filter === 'all' ? orders : orders.filter((o) => o.status === filter);
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, filter]);

  const updateStatus = async (id: number, status: string) => {
    setBusyId(id);
    try {
      await api.updateOrderStatus(id, status);
      setOrders((prev) => (prev || []).map((o) => (o.id === id ? { ...o, status } : o)));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const del = async (invoice: string) => {
    if (!confirm(`Delete order ${invoice}? This permanently removes it.`)) return;
    try {
      await api.deleteOrder(invoice);
      setOrders((prev) => (prev || []).filter((o) => o.invoice !== invoice));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const countByStatus = (s: string) => orders?.filter((o) => o.status === s).length || 0;

  if (loading || (user?.role === 'ADMIN' && orders === null)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="h-9 w-56 rounded-lg bg-muted animate-pulse" />
        <div className="mt-8 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground">Access denied</h1>
        <p className="mt-2 text-muted-foreground text-[15px]">Admins only.</p>
        <Link href="/" className="inline-flex mt-6 h-11 px-6 items-center rounded-full bg-foreground text-background text-[15px] font-medium hover:opacity-90">
          Go home
        </Link>
      </div>
    );
  }

  const filters = ['all', ...ORDER_STATUS];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-[14px] text-[#0071e3] hover:underline mb-2">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Dashboard
      </Link>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Orders</h1>
      <p className="text-[14px] text-muted-foreground mt-1">{orders?.length} total · {confirms.length} payment proofs</p>

      {err && <div className="mt-6 p-4 rounded-2xl bg-card border border-destructive/30 text-destructive text-[14px]">{err}</div>}

      {/* Filter chips */}
      <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filters.map((f) => {
          const active = filter === f;
          const cnt = f === 'all' ? orders?.length || 0 : countByStatus(f);
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 h-8 px-3 rounded-full text-[12px] font-medium transition-colors ${
                active ? 'bg-[#0071e3] text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'All' : statusLabel(f)} <span className="opacity-70">({cnt})</span>
            </button>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="mt-6 hidden lg:block rounded-2xl bg-card border border-border shadow-card overflow-hidden">
        <table className="w-full text-[13px]">
          <thead className="bg-muted/50">
            <tr className="text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No orders match this filter.</td></tr>
            )}
            {filtered.map((o) => {
              const sc = statusColor(o.status);
              const hasProof = confirms.some((c) => c.invoice === o.invoice);
              return (
                <tr key={o.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/orders/${o.invoice}`} className="font-mono font-medium text-foreground hover:text-[#0071e3]">{o.invoice}</Link>
                      {hasProof && (
                        <button
                          onClick={() => setViewProof(confirms.find((c) => c.invoice === o.invoice) || null)}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-[#f59e0b] text-[#1d1d1f] font-semibold"
                          title="Payment proof"
                        >
                          PROOF
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{o.username}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(o.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.totalquantity}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{formatIDR(Number(o.subtotal))}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      disabled={busyId === o.id}
                      className="h-8 px-2 rounded-lg bg-background border border-border text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 disabled:opacity-50"
                    >
                      {ORDER_STATUS.map((s) => (
                        <option key={s} value={s}>{statusLabel(s)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => del(o.invoice)}
                      className="w-8 h-8 rounded-lg hover:bg-muted inline-flex items-center justify-center text-muted-foreground hover:text-destructive"
                      aria-label="Delete"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-6 lg:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="p-8 rounded-2xl bg-card border border-border text-center text-muted-foreground text-[14px]">
            No orders match this filter.
          </div>
        )}
        {filtered.map((o) => {
          const sc = statusColor(o.status);
          const hasProof = confirms.some((c) => c.invoice === o.invoice);
          return (
            <div key={o.id} className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/orders/${o.invoice}`} className="font-mono text-[13px] font-medium text-foreground hover:text-[#0071e3]">{o.invoice}</Link>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: sc.bg, color: sc.fg }}>
                  {statusLabel(o.status)}
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-1">{o.username} · {new Date(o.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[14px] font-semibold text-foreground">{formatIDR(Number(o.subtotal))}</span>
                <span className="text-[12px] text-muted-foreground">{o.totalquantity} items</span>
              </div>
              <div className="mt-3 flex gap-2">
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  disabled={busyId === o.id}
                  className="flex-1 h-9 px-2 rounded-lg bg-background border border-border text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 disabled:opacity-50"
                >
                  {ORDER_STATUS.map((s) => (
                    <option key={s} value={s}>{statusLabel(s)}</option>
                  ))}
                </select>
                {hasProof && (
                  <button
                    onClick={() => setViewProof(confirms.find((c) => c.invoice === o.invoice) || null)}
                    className="h-9 px-3 rounded-lg bg-[#f59e0b] text-[#1d1d1f] text-[12px] font-semibold"
                  >
                    Proof
                  </button>
                )}
                <button
                  onClick={() => del(o.invoice)}
                  className="w-9 h-9 rounded-lg bg-destructive/10 text-destructive inline-flex items-center justify-center"
                  aria-label="Delete"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Proof modal */}
      {viewProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setViewProof(null)}>
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-card-hover overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <p className="text-[14px] font-semibold text-foreground">Payment proof</p>
                <p className="text-[12px] font-mono text-muted-foreground">{viewProof.invoice}</p>
              </div>
              <button onClick={() => setViewProof(null)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4">
              <p className="text-[12px] text-muted-foreground mb-2">Submitted by {viewProof.username}</p>
              {viewProof.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={viewProof.image.startsWith('http') ? viewProof.image : `/products/${viewProof.image}`} alt="Proof" className="w-full rounded-xl object-contain max-h-[60vh]" />
              ) : (
                <p className="text-[13px] text-muted-foreground p-8 text-center">No image available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
