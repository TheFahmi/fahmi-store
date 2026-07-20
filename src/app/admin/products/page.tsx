'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import {
  api,
  formatIDR,
  productImage,
  type Category,
  type Product,
} from '@/lib/api';

type FormState = {
  nama: string;
  harga: string;
  deskripsi: string;
  stok: string;
  rating: string;
  idcategory: string;
  image: File | null;
};

const EMPTY: FormState = {
  nama: '',
  harga: '',
  deskripsi: '',
  stok: '',
  rating: '4.5',
  idcategory: '1',
  image: null,
};

export default function AdminProductsPage() {
  const { user, loading } = useAuth();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [err, setErr] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');

  const load = () => {
    api.adminGetProducts().then((p) => setProducts(Array.isArray(p) ? p : [])).catch((e) => {
      setErr(e instanceof Error ? e.message : 'Failed');
      setProducts([]);
    });
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      load();
      api.adminGetCategories().then((c) => setCats(Array.isArray(c) ? c : [])).catch(() => {});
    }
  }, [user]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setFormErr('');
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      nama: p.nama,
      harga: String(p.harga || ''),
      deskripsi: p.deskripsi || '',
      stok: String(p.stok || ''),
      rating: String(p.rating || '4.5'),
      idcategory: String(p.idcategory || p.idcat || '1'),
      image: null,
    });
    setFormErr('');
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim() || !form.harga) {
      setFormErr('Name and price are required');
      return;
    }
    setSaving(true);
    setFormErr('');
    try {
      if (editing) {
        await api.updateProduct(editing.id, {
          nama: form.nama,
          harga: Number(form.harga),
          deskripsi: form.deskripsi,
          stok: Number(form.stok || 0),
          rating: Number(form.rating || 0),
          idcategory: Number(form.idcategory || 1),
        });
      } else {
        const fd = new FormData();
        fd.append('nama', form.nama);
        fd.append('harga', form.harga);
        fd.append('deskripsi', form.deskripsi);
        fd.append('stok', form.stok || '0');
        fd.append('rating', form.rating || '4.5');
        fd.append('idcategory', form.idcategory || '1');
        if (form.image) fd.append('image', form.image);
        await api.addProduct(fd);
      }
      setShowForm(false);
      load();
    } catch (ex) {
      setFormErr(ex instanceof Error ? ex.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const del = async (p: Product) => {
    if (!confirm(`Delete "${p.nama}"? This cannot be undone.`)) return;
    try {
      await api.deleteProduct(p.id);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  if (loading || (user?.role === 'ADMIN' && products === null)) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-[14px] text-[#0071e3] hover:underline mb-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-foreground">Products</h1>
          <p className="text-[14px] text-muted-foreground mt-1">{products?.length} products in catalog</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#0071e3] text-white text-[14px] font-medium hover:bg-[#0077ed] transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}><path d="M12 5v14M5 12h14" /></svg>
          Add product
        </button>
      </div>

      {err && <div className="mt-6 p-4 rounded-2xl bg-card border border-destructive/30 text-destructive text-[14px]">{err}</div>}

      {products && products.length === 0 && !err && (
        <div className="mt-8 p-10 rounded-2xl bg-card border border-border text-center">
          <p className="text-muted-foreground text-[14px]">No products yet. Add your first one.</p>
        </div>
      )}

      {/* Desktop table */}
      {products && products.length > 0 && (
        <div className="mt-8 hidden md:block rounded-2xl bg-card border border-border shadow-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-right">Price</th>
                <th className="px-4 py-3 font-medium text-right">Stock</th>
                <th className="px-4 py-3 font-medium text-right">Rating</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={productImage(p.image, p.nama, p.idcategory)} alt={p.nama} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-medium text-foreground line-clamp-1 max-w-[260px]">{p.nama}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.namacategory || cats.find((c) => c.id === (p.idcategory || p.idcat))?.nama || '—'}</td>
                  <td className="px-4 py-3 text-right text-foreground font-medium">{formatIDR(Number(p.harga))}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={Number(p.stok) <= 5 ? 'text-destructive font-medium' : 'text-foreground'}>
                      {p.stok}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{Number(p.rating).toFixed(1)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-[#0071e3]"
                        aria-label="Edit"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button
                        onClick={() => del(p)}
                        className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive"
                        aria-label="Delete"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile cards */}
      {products && products.length > 0 && (
        <div className="mt-8 md:hidden space-y-3">
          {products.map((p) => (
            <div key={p.id} className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex gap-3">
                <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={productImage(p.image, p.nama, p.idcategory)} alt={p.nama} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-foreground line-clamp-1">{p.nama}</p>
                  <p className="text-[12px] text-muted-foreground">{p.namacategory || '—'}</p>
                  <div className="flex items-center gap-3 mt-1 text-[12px]">
                    <span className="font-semibold text-foreground">{formatIDR(Number(p.harga))}</span>
                    <span className={Number(p.stok) <= 5 ? 'text-destructive' : 'text-muted-foreground'}>Stock {p.stok}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => openEdit(p)} className="flex-1 h-9 rounded-lg bg-muted text-foreground text-[13px] font-medium hover:bg-muted/70">
                  Edit
                </button>
                <button onClick={() => del(p)} className="flex-1 h-9 rounded-lg bg-destructive/10 text-destructive text-[13px] font-medium hover:bg-destructive/20">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowForm(false)}>
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-card-hover p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-foreground">{editing ? 'Edit product' : 'Add product'}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={submit} className="mt-4 space-y-3">
              <div>
                <label className="text-[12px] text-muted-foreground">Name</label>
                <input
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] text-muted-foreground">Price (IDR)</label>
                  <input
                    value={form.harga}
                    onChange={(e) => setForm({ ...form, harga: e.target.value })}
                    type="number"
                    className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                  />
                </div>
                <div>
                  <label className="text-[12px] text-muted-foreground">Stock</label>
                  <input
                    value={form.stok}
                    onChange={(e) => setForm({ ...form, stok: e.target.value })}
                    type="number"
                    className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] text-muted-foreground">Category</label>
                  <select
                    value={form.idcategory}
                    onChange={(e) => setForm({ ...form, idcategory: e.target.value })}
                    className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                  >
                    {cats.map((c) => (
                      <option key={c.id} value={c.id}>{c.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] text-muted-foreground">Rating</label>
                  <input
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                  />
                </div>
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground">Description</label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 resize-none"
                />
              </div>
              {!editing && (
                <div>
                  <label className="text-[12px] text-muted-foreground">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                    className="mt-1 block w-full text-[12px] text-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#0071e3] file:text-white file:text-[12px] file:font-medium hover:file:bg-[#0077ed]"
                  />
                </div>
              )}
              {formErr && <p className="text-[13px] text-destructive">{formErr}</p>}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 h-10 rounded-full border border-border text-foreground text-[14px] font-medium hover:bg-muted">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-10 rounded-full bg-[#0071e3] text-white text-[14px] font-medium hover:bg-[#0077ed] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving…' : editing ? 'Save changes' : 'Add product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
