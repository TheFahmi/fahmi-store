import { Suspense } from 'react';
import ProductsPage from './page-inner';

export default function Page() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-20 text-muted-foreground text-[15px]">Loading...</div>}>
      <ProductsPage />
    </Suspense>
  );
}
