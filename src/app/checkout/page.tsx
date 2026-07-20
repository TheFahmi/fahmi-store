'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import {
  api,
  formatIDR,
  generateInvoice,
  paymentDeadline,
  nowMySQL,
  productImage,
} from '@/lib/api';

type PayMethod = 'transfer' | 'ewallet' | 'cod';

const BANKS = [
  { id: 'bca', name: 'BCA', acc: '1234567890', holder: 'Fahmi Store' },
  { id: 'mandiri', name: 'Mandiri', acc: '9876543210', holder: 'Fahmi Store' },
  { id: 'bni', name: 'BNI', acc: '5555666677', holder: 'Fahmi Store' },
];

const WALLETS = [
  { id: 'gopay', name: 'GoPay', acc: '081234567890' },
  { id: 'ovo', name: 'OVO', acc: '081234567890' },
  { id: 'dana', name: 'DANA', acc: '081234567890' },
];

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, loading, refresh } = useCart();
  const router = useRouter();

  const [alamat, setAlamat] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState<PayMethod>('transfer');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; pct: number } | null>(null);
  const [placing, setPlacing] = useState(false);
  const [err, setErr] = useState('');
  const [promoErr, setPromoErr] = useState('');

  useEffect(() => {
    if (user) {
      setAlamat(user.alamat || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + Number(i.harga || 0) * Number(i.kuantiti || i.qty || 0), 0),
    [items]
  );
  const totalQty = useMemo(
    () => items.reduce((s, i) => s + (Number(i.kuantiti) || Number(i.qty) || 0), 0),
    [items]
  );
  const shipping = subtotal > 500000 || subtotal === 0 ? 0 : 25000;
  const discount = appliedPromo ? Math.round(subtotal * (appliedPromo.pct / 100)) : 0;
  const tax = Math.round((subtotal - discount) * 0.11);
  const total = Math.max(0, subtotal - discount + shipping + tax);

  const applyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoErr('');
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    try {
      const promos = await api.getPromos();
      const found = (promos || []).find((p) => String(p.code).toUpperCase() === code);
      if (found) {
        setAppliedPromo({ code: found.code, pct: Number(found.discount) || 0 });
      } else if (code === 'FAHMI10') {
        setAppliedPromo({ code, pct: 10 });
      } else {
        setPromoErr('Invalid promo code');
      }
    } catch {
      if (code === 'FAHMI10') setAppliedPromo({ code, pct: 10 });
      else setPromoErr('Unable to verify promo');
    }
  };

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-4.42 0-8 2.24-8 5v2h16v-2c0-2.76-3.58-5-8-5z" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Sign in to checkout</h1>
        <p className="mt-2 text-muted-foreground text-[15px]">You need an account to place an order.</p>
        <Link
          href="/login"
          className="inline-flex mt-6 h-11 px-6 items-center rounded-full bg-[#0071e3] text-white text-[15px] font-medium hover:bg-[#0077ed]"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="h-9 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
          <div className="h-72 rounded-2xl bg-muted animate-pulse" />
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
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Nothing to check out</h1>
        <p className="mt-2 text-muted-foreground text-[15px]">Your cart is empty. Add some products first.</p>
        <Link
          href="/products"
          className="inline-flex mt-6 h-11 px-6 items-center rounded-full bg-[#0071e3] text-white text-[15px] font-medium hover:bg-[#0077ed]"
        >
          Browse products
        </Link>
      </div>
    );
  }

  const placeOrder = async () => {
    setErr('');
    if (!alamat.trim() || !phone.trim() || !email.trim()) {
      setErr('Please fill in shipping address, phone, and email.');
      return;
    }
    if (method !== 'cod' && !appliedPromo && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErr('Please enter a valid email.');
      return;
    }
    setPlacing(true);
    const invoice = generateInvoice();
    try {
      const order = await api.createOrder({
        username: user.username,
        date: nowMySQL(),
        subtotal: total,
        totalquantity: totalQty,
        invoice,
        status: 'unpaid',
        email,
        waktuexp: paymentDeadline(),
        totalpotongan: discount,
      });
      const idtrx = Number(order.insertId || 0);
      await Promise.all(
        items.map((it) =>
          api.createOrderDetail({
            idtrx,
            idproduct: Number(it.idproduct || 0),
            qty: Number(it.kuantiti || it.qty || 0),
            totalprice: Number(it.harga || 0) * Number(it.kuantiti || it.qty || 0),
          })
        )
      );
      // Clear cart
      await Promise.all(items.map((it) => api.deleteCart(it.id).catch(() => {})));
      await refresh();
      router.push(`/orders/${invoice}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to place order. Please try again.');
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/cart" className="inline-flex items-center gap-1.5 text-[14px] text-[#0071e3] hover:underline mb-3">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to cart
      </Link>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Checkout</h1>
      <p className="text-[14px] text-muted-foreground mt-1">Review your order and complete the purchase.</p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        <div className="lg:col-span-2 space-y-4 min-w-0">
          {/* Shipping */}
          <section className="p-6 rounded-2xl bg-card border border-border shadow-card">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0071e3] text-white text-[12px] font-semibold flex items-center justify-center">1</span>
              <h2 className="text-[17px] font-semibold text-foreground">Shipping address</h2>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[12px] text-muted-foreground">Full address</label>
                <textarea
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  rows={3}
                  placeholder="Street, city, postal code"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 resize-none"
                />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="p-6 rounded-2xl bg-card border border-border shadow-card">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0071e3] text-white text-[12px] font-semibold flex items-center justify-center">2</span>
              <h2 className="text-[17px] font-semibold text-foreground">Payment method</h2>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {([
                { id: 'transfer' as const, label: 'Bank Transfer', sub: 'BCA · Mandiri · BNI' },
                { id: 'ewallet' as const, label: 'E-Wallet', sub: 'GoPay · OVO · DANA' },
                { id: 'cod' as const, label: 'Cash on Delivery', sub: 'Pay when it arrives' },
              ]).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`text-left p-4 rounded-xl border transition-colors ${
                    method === m.id
                      ? 'border-[#0071e3] bg-[#0071e3]/5'
                      : 'border-border bg-background hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-foreground">{m.label}</span>
                    <span className={`w-4 h-4 rounded-full border-2 ${method === m.id ? 'border-[#0071e3] bg-[#0071e3]' : 'border-border'}`} />
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-1">{m.sub}</p>
                </button>
              ))}
            </div>

            {method === 'transfer' && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {BANKS.map((b) => (
                  <div key={b.id} className="p-3 rounded-xl bg-muted">
                    <p className="text-[12px] text-muted-foreground">{b.name}</p>
                    <p className="text-[14px] font-semibold text-foreground mt-0.5">{b.acc}</p>
                    <p className="text-[11px] text-muted-foreground">{b.holder}</p>
                  </div>
                ))}
              </div>
            )}
            {method === 'ewallet' && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {WALLETS.map((w) => (
                  <div key={w.id} className="p-3 rounded-xl bg-muted">
                    <p className="text-[12px] text-muted-foreground">{w.name}</p>
                    <p className="text-[14px] font-semibold text-foreground mt-0.5">{w.acc}</p>
                  </div>
                ))}
              </div>
            )}
            {method === 'cod' && (
              <p className="mt-4 text-[13px] text-muted-foreground p-3 rounded-xl bg-muted">
                Pay in cash when your order is delivered. A Rp 5.000 handling fee applies (waived above Rp 500.000).
              </p>
            )}
          </section>

          {/* Items */}
          <section className="p-6 rounded-2xl bg-card border border-border shadow-card">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0071e3] text-white text-[12px] font-semibold flex items-center justify-center">3</span>
              <h2 className="text-[17px] font-semibold text-foreground">Items ({items.length})</h2>
            </div>
            <div className="mt-4 divide-y divide-border">
              {items.map((it) => {
                const qty = Number(it.kuantiti || it.qty || 0);
                const nama = it.Nama_product || it.nama || 'Product';
                return (
                  <div key={it.id} className="py-3 flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={productImage(it.image, nama)} alt={nama} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-foreground line-clamp-1">{nama}</p>
                      <p className="text-[12px] text-muted-foreground">{formatIDR(Number(it.harga))} × {qty}</p>
                    </div>
                    <span className="text-[15px] font-semibold text-foreground">{formatIDR(Number(it.harga) * qty)}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 p-6 rounded-2xl bg-card border border-border shadow-card">
            <h2 className="text-[17px] font-semibold text-foreground">Order summary</h2>

            <form onSubmit={applyPromo} className="mt-4 flex gap-2">
              <input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Promo code"
                className="flex-1 h-10 px-3 rounded-lg bg-background border border-border text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
              />
              <button type="submit" className="h-10 px-4 rounded-lg bg-foreground text-background text-[14px] font-medium hover:opacity-90">
                Apply
              </button>
            </form>
            {appliedPromo && (
              <p className="mt-2 text-[12px] text-success flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9L10 15.9 4.8 18.8l1-5.9L1.5 8.6l5.9-.9L10 1.5z" /></svg>
                Code {appliedPromo.code} applied — {appliedPromo.pct}% off
              </p>
            )}
            {promoErr && <p className="mt-2 text-[12px] text-destructive">{promoErr}</p>}

            <dl className="mt-5 space-y-2.5 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal ({totalQty} items)</dt>
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

            {err && <p className="mt-3 text-[13px] text-destructive">{err}</p>}

            <button
              onClick={placeOrder}
              disabled={placing}
              className="mt-5 w-full h-11 rounded-full bg-[#0071e3] text-white text-[15px] font-medium hover:bg-[#0077ed] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {placing ? 'Placing order…' : `Place order · ${formatIDR(total)}`}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-muted-foreground">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z" />
              </svg>
              Secure checkout · 24h payment window
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
