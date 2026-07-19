'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, formatIDR, productImage, type Product } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { add } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!id) return;
    api
      .getProduct(id)
      .then((p) => setProduct(p || null))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const onAdd = async () => {
    if (!product) return;
    if (!user) {
      router.push('/login');
      return;
    }
    setBusy(true);
    setErr('');
    setMsg('');
    try {
      await add(product, qty);
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/products" className="text-[13px] text-muted-foreground hover:text-foreground">
        &larr; Products
      </Link>

      <div className="mt-6 grid md:grid-cols-2 gap-10">
        <div className="aspect-square rounded-3xl bg-muted overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={productImage(product.image, product.nama)}
            alt={product.nama}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">{product.nama}</h1>
          {product.rating != null && (
            <p className="mt-2 text-[13px] text-muted-foreground">{Number(product.rating).toFixed(1)} rating</p>
          )}
          <p className="mt-4 text-2xl font-semibold text-foreground tracking-[-0.01em]">{formatIDR(product.harga)}</p>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{product.deskripsi}</p>

          <div className="mt-6 flex items-center gap-3 text-[13px] text-muted-foreground">
            <span className={product.stok > 0 ? 'text-success' : 'text-destructive'}>
              {product.stok > 0 ? `${product.stok} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-border bg-card">
              <button
                className="w-10 h-10 text-lg text-muted-foreground hover:text-foreground"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                &#8722;
              </button>
              <span className="w-10 text-center text-[15px] font-medium">{qty}</span>
              <button
                className="w-10 h-10 text-lg text-muted-foreground hover:text-foreground"
                onClick={() => setQty((q) => Math.min(product.stok || 99, q + 1))}
              >
                +
              </button>
            </div>
            <button
              disabled={busy || product.stok <= 0}
              onClick={onAdd}
              className="flex-1 h-11 rounded-full bg-[#0071e3] text-white text-[15px] font-medium hover:bg-[#0077ed] disabled:opacity-50"
            >
              {busy ? 'Adding...' : 'Add to cart'}
            </button>
          </div>

          {msg && <p className="mt-3 text-[13px] text-success">{msg}</p>}
          {err && <p className="mt-3 text-[13px] text-destructive">{err}</p>}
        </div>
      </div>
    </div>
  );
}
