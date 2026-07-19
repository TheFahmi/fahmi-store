'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, formatIDR, productImage, type Product } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import ProductCard from '@/components/ProductCard';

function Stars({ rating, size = 'w-4 h-4' }: { rating: number; size?: string }) {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`${size} ${i <= Math.round(r) ? 'text-[#f59e0b]' : 'text-muted-foreground/30'}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9L10 15.9 4.8 18.8l1-5.9L1.5 8.6l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

const FEATURES = [
  'Free shipping over Rp500K',
  '30-day money-back guarantee',
  'Genuine product with warranty',
  'Secure checkout & encrypted payment',
];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { add } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [activeThumb, setActiveThumb] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getProduct(id)
      .then(async (p) => {
        setProduct(p || null);
        if (p) {
          try {
            const all = await api.getProducts();
            const idcat = p.idcat ?? p.idcategory;
            const rel = all.filter((x) => x.id !== p.id && (x.idcat ?? x.idcategory) === idcat).slice(0, 4);
            setRelated(rel.length > 0 ? rel : all.filter((x) => x.id !== p.id).slice(0, 4));
          } catch {}
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const onAdd = async (buyNow = false) => {
    if (!product) return;
    if (!user) { router.push('/login'); return; }
    setBusy(true); setErr(''); setMsg('');
    try {
      await add(product, qty);
      if (buyNow) { router.push('/cart'); return; }
      setMsg('Added to cart');
    } catch (e: any) {
      setErr(e?.message || 'Failed to add');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square rounded-3xl bg-muted animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 bg-muted rounded-xl animate-pulse" />
            <div className="h-4 w-1/3 bg-muted rounded-xl animate-pulse" />
            <div className="h-20 w-full bg-muted rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-muted-foreground text-[15px]">Product not found</p>
        <Link href="/products" className="text-[#0071e3] text-[15px] mt-4 inline-block hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  const idcat = product.idcat ?? product.idcategory;
  const catName = product.namacategory || 'Product';
  const reviews = Math.floor(Number(product.rating || 0) * 37 + 12);
  const discount = product.harga > 500000 ? Math.round(product.harga * 0.1) : 0;
  const originalPrice = discount ? product.harga + discount : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[13px] text-muted-foreground mb-6 flex-wrap">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="text-muted-foreground/50">/</span>
        <Link href="/products" className="hover:text-foreground">Products</Link>
        <span className="text-muted-foreground/50">/</span>
        <Link href={`/products?cat=${idcat}`} className="hover:text-foreground">{catName}</Link>
        <span className="text-muted-foreground/50">/</span>
        <span className="text-foreground truncate max-w-[200px]">{product.nama}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div>
          <div className="aspect-square rounded-3xl bg-muted overflow-hidden relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={productImage(product.image, product.nama, idcat)}
              alt={product.nama}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 text-[12px] font-semibold bg-[#ff3b30] text-white px-2.5 py-1 rounded-full">-10%</span>
            )}
          </div>
          {/* Thumbnails */}
          <div className="mt-3 grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                onClick={() => setActiveThumb(i)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors ${activeThumb === i ? 'border-[#0071e3]' : 'border-transparent'}`}
              >
                <div className="w-full h-full" style={{ background: ['#1d1d1f', '#0a84ff', '#f59e0b', '#30d158'][i % 4] }}>
                  <div className="w-full h-full flex items-center justify-center text-white/70 text-[11px]">View {i + 1}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          {product.namacategory && (
            <Link href={`/products?cat=${idcat}`} className="text-[13px] text-[#0071e3] hover:underline">{catName}</Link>
          )}
          <h1 className="mt-1 text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">{product.nama}</h1>

          <div className="mt-3 flex items-center gap-3">
            <Stars rating={product.rating || 0} />
            <span className="text-[13px] text-muted-foreground">{Number(product.rating || 0).toFixed(1)}</span>
            <span className="text-muted-foreground/50">·</span>
            <span className="text-[13px] text-muted-foreground">{reviews} reviews</span>
          </div>

          <div className="mt-5 flex flex-col gap-1.5">
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="text-2xl sm:text-3xl font-semibold text-foreground tracking-[-0.02em]">{formatIDR(product.harga)}</p>
              {originalPrice > 0 && (
                <p className="text-[15px] text-muted-foreground line-through">{formatIDR(originalPrice)}</p>
              )}
            </div>
            {discount > 0 && (
              <span className="self-start text-[11px] font-semibold text-[#ff3b30] bg-[#ff3b30]/10 px-2 py-0.5 rounded-full">Save {formatIDR(discount)}</span>
            )}
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">{product.deskripsi}</p>

          {/* Stock */}
          <div className="mt-5 flex items-center gap-2 text-[14px]">
            <span className={`w-2 h-2 rounded-full ${product.stok > 0 ? 'bg-[#30d158]' : 'bg-[#ff3b30]'}`} />
            <span className={product.stok > 0 ? 'text-success' : 'text-destructive'}>
              {product.stok > 0 ? `In stock — ${product.stok} available` : 'Out of stock'}
            </span>
          </div>

          {/* Quantity + actions */}
          <div className="mt-7 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-border bg-card">
              <button
                className="w-11 h-11 text-lg text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease"
              >&#8722;</button>
              <span className="w-10 text-center text-[15px] font-medium">{qty}</span>
              <button
                className="w-11 h-11 text-lg text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setQty((q) => Math.min(product.stok || 99, q + 1))}
                aria-label="Increase"
              >+</button>
            </div>
            <button
              disabled={busy || product.stok <= 0}
              onClick={() => onAdd(false)}
              className="flex-1 h-11 rounded-full bg-[#0071e3] text-white text-[15px] font-medium hover:bg-[#0077ed] disabled:opacity-50 transition-colors"
            >
              {busy ? 'Adding…' : 'Add to cart'}
            </button>
          </div>
          <button
            disabled={busy || product.stok <= 0}
            onClick={() => onAdd(true)}
            className="mt-2 w-full h-11 rounded-full bg-foreground text-background text-[15px] font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Buy now
          </button>

          {msg && <p className="mt-3 text-[13px] text-success flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9L10 15.9 4.8 18.8l1-5.9L1.5 8.6l5.9-.9L10 1.5z" /></svg>
            {msg}
          </p>}
          {err && <p className="mt-3 text-[13px] text-destructive">{err}</p>}

          {/* Features */}
          <ul className="mt-7 space-y-2.5 border-t border-border pt-6">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-[14px] text-foreground">
                <svg className="w-4 h-4 mt-0.5 text-[#30d158] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                  <path d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-20">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-foreground">You may also like</h2>
              <p className="text-[14px] text-muted-foreground mt-1">Related products in {catName}</p>
            </div>
            <Link href={`/products?cat=${idcat}`} className="text-[14px] text-[#0071e3] hover:underline">See all</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
