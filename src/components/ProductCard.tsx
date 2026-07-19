'use client';

import Link from 'next/link';
import { formatIDR, productImage, type Product } from '@/lib/api';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-muted relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={productImage(product.image, product.nama)}
          alt={product.nama}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
        {product.stok <= 0 && (
          <span className="absolute top-3 left-3 text-xs font-medium bg-card/90 text-muted-foreground px-2 py-1 rounded-full">
            Sold out
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-medium text-foreground leading-snug line-clamp-2">
            {product.nama}
          </h3>
        </div>
        {product.namacategory && (
          <p className="mt-1 text-xs text-muted-foreground">{product.namacategory}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[15px] font-semibold text-foreground">{formatIDR(product.harga)}</p>
          {product.rating != null && (
            <span className="text-xs text-muted-foreground">★ {Number(product.rating).toFixed(1)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
