'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth';
import {
  api,
  formatIDR,
  productImage,
  statusColor,
  statusLabel,
  type JoinedOrder,
  ORDER_STATUS,
} from '@/lib/api';

const TIMELINE = ['unpaid', 'waiting_confirmation', 'confirmed', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const params = useParams<{ invoice: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const invoice = decodeURIComponent(params.invoice);

  const [rows, setRows] = useState<JoinedOrder[] | null>(null);
  const [err, setErr] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .getJoinedOrders()
      .then((data) => {
        const mine = (data || []).filter((r) => r.invoice === invoice);
        if (mine.length === 0) {
          setErr('Order not found');
        }
        setRows(mine);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : 'Failed to load order'));
  }, [invoice]);

  const order = rows?.[0];
  const items = useMemo(() => rows || [], [rows]);
  const timelineIndex = order ? TIMELINE.indexOf(order.status) : -1;

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;
    setUploading(true);
    setUploadMsg(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('invoice', invoice);
      fd.append('username', user.username);
      await api.uploadPayment(fd);
      setUploadMsg({ ok: true, text: 'Payment confirmation uploaded. Store admin will verify shortly.' });
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (ex) {
      setUploadMsg({ ok: false, text: ex instanceof Error ? ex.message : 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || (rows === null && !err)) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="h-9 w-56 rounded-lg bg-muted animate-pulse" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (err || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/orders" className="inline-flex items-center gap-1.5 text-[14px] text-[#0071e3] hover:underline mb-3">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to orders
        </Link>
        <div className="p-8 rounded-2xl bg-card border border-border text-center">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">{err || 'Order not found'}</h1>
          <p className="mt-2 text-muted-foreground text-[14px]">We couldn't find this order.</p>
        </div>
      </div>
    );
  }

  const sc = statusColor(order.status);
  const deadline = new Date(order.waktuexp);
  const expired = order.status === 'expired' || (order.status === 'unpaid' && deadline.getTime() < Date.now());

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/orders" className="inline-flex items-center gap-1.5 text-[14px] text-[#0071e3] hover:underline mb-3">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Order detail</h1>
          <p className="text-[13px] font-mono text-muted-foreground mt-1">{invoice}</p>
        </div>
        <span
          className="self-start text-[11px] px-3 py-1 rounded-full font-semibold"
          style={{ background: sc.bg, color: sc.fg }}
        >
          {statusLabel(order.status)}
        </span>
      </div>

      {/* Status timeline */}
      {order.status !== 'cancelled' && order.status !== 'expired' && (
        <div className="mt-6 p-5 rounded-2xl bg-card border border-border shadow-card">
          <h2 className="text-[15px] font-semibold text-foreground mb-4">Status</h2>
          <ol className="relative flex justify-between">
            <span className="absolute left-0 right-0 top-3 h-0.5 bg-border" aria-hidden />
            <span
              className="absolute left-0 top-3 h-0.5 bg-[#0071e3] transition-all"
              style={{ width: timelineIndex >= 0 ? `${(timelineIndex / (TIMELINE.length - 1)) * 100}%` : '0%' }}
              aria-hidden
            />
            {TIMELINE.map((s, i) => {
              const done = i <= timelineIndex;
              return (
                <li key={s} className="relative z-10 flex flex-col items-center gap-1.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                      done ? 'bg-[#0071e3] text-white' : 'bg-muted text-muted-foreground border border-border'
                    }`}
                  >
                    {done ? (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className={`text-[10px] text-center max-w-[70px] ${done ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {statusLabel(s)}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {(expired || order.status === 'unpaid') && (
        <div className={`mt-4 p-4 rounded-2xl border ${expired ? 'border-destructive/30 bg-destructive/5' : 'border-[#f59e0b]/30 bg-[#f59e0b]/5'}`}>
          <p className="text-[13px] font-medium text-foreground">
            {expired
              ? 'Payment window expired'
              : `Payment due by ${deadline.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}`}
          </p>
          {!expired && (
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Upload your payment proof below. Status will update after admin verifies.
            </p>
          )}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        {/* Items + info */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <section className="p-5 rounded-2xl bg-card border border-border shadow-card">
            <h2 className="text-[15px] font-semibold text-foreground mb-3">Items</h2>
            <div className="divide-y divide-border">
              {items.map((it, idx) => {
                const qty = Number(it.qty || 0);
                const nama = it.nama || 'Product';
                const price = Number(it.totalprice || 0);
                return (
                  <div key={idx} className="py-3 flex gap-3 items-center">
                    <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={productImage(null, nama)} alt={nama} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-foreground line-clamp-1">{nama}</p>
                      <p className="text-[12px] text-muted-foreground">Qty {qty}</p>
                    </div>
                    <span className="text-[14px] font-semibold text-foreground">{formatIDR(price)}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {order.alamat && (
            <section className="p-5 rounded-2xl bg-card border border-border shadow-card">
              <h2 className="text-[15px] font-semibold text-foreground mb-2">Shipping address</h2>
              <p className="text-[14px] text-foreground">{order.alamat}</p>
              {order.phone && <p className="text-[13px] text-muted-foreground mt-1">{order.phone}</p>}
            </section>
          )}
        </div>

        {/* Summary + upload */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-2xl bg-card border border-border shadow-card">
            <h2 className="text-[15px] font-semibold text-foreground">Summary</h2>
            <dl className="mt-3 space-y-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Date</dt>
                <dd className="text-foreground">{new Date(order.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Items</dt>
                <dd className="text-foreground">{order.totalquantity}</dd>
              </div>
              {Number(order.totalpotongan) > 0 && (
                <div className="flex justify-between">
                  <dt className="text-success">Discount</dt>
                  <dd className="text-success">−{formatIDR(Number(order.totalpotongan))}</dd>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-border">
                <dt className="text-[14px] font-medium text-foreground">Total</dt>
                <dd className="text-[18px] font-semibold text-foreground tracking-[-0.02em]">{formatIDR(Number(order.subtotal))}</dd>
              </div>
            </dl>
          </div>

          {/* Payment upload */}
          {(order.status === 'unpaid' || order.status === 'waiting_confirmation') && !expired && (
            <form onSubmit={submitPayment} className="p-5 rounded-2xl bg-card border border-border shadow-card">
              <h2 className="text-[15px] font-semibold text-foreground">Payment confirmation</h2>
              <p className="text-[12px] text-muted-foreground mt-1">
                Upload a screenshot or photo of your transfer receipt.
              </p>
              <label className="mt-3 block">
                <span className="text-[12px] text-muted-foreground">Receipt image</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="mt-1 block w-full text-[12px] text-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#0071e3] file:text-white file:text-[12px] file:font-medium hover:file:bg-[#0077ed]"
                />
              </label>
              {uploadMsg && (
                <p className={`mt-2 text-[12px] ${uploadMsg.ok ? 'text-success' : 'text-destructive'}`}>{uploadMsg.text}</p>
              )}
              <button
                type="submit"
                disabled={!file || uploading}
                className="mt-4 w-full h-10 rounded-full bg-[#0071e3] text-white text-[14px] font-medium hover:bg-[#0077ed] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? 'Uploading…' : 'Submit proof'}
              </button>
            </form>
          )}

          {order.status === 'waiting_confirmation' && (
            <div className="p-4 rounded-2xl bg-[#f59e0b]/10 border border-[#f59e0b]/30">
              <p className="text-[13px] text-foreground">
                Proof received. Waiting for admin verification.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
