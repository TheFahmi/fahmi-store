'use client';

import Link from 'next/link';
import { formatIDR, productImage, type Product } from '@/lib/api';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block bg-card rounded-2xl overflow-hidden transition-shadow duration-500 group-hover:shadow-md"
    >
      <div className="aspect-[3/4] bg-muted relative overflow-hidden rounded-t-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={productImage(product.image, product.nama)}
          alt={product.nama}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
        />
        {product.stok <= 0 && (
          <span className="absolute top-3 left-3 text-[13px] font-medium bg-white/90 dark:bg-black/70 text-muted-foreground px-2.5 py-1 rounded-full">
            Sold out
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-[15px] font-medium text-foreground leading-snug line-clamp-2">
          {product.nama}
        </h3>
        {product.namacategory && (
          <p className="mt-1 text-[13px] text-muted-foreground">{product.namacategory}</p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[15px] font-semibold text-foreground">{formatIDR(product.harga)}</p>
          {product.rating != null && (
            <span className="text-[13px] text-muted-foreground">{Number(product.rating).toFixed(1)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
