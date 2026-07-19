import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[15px] font-semibold text-foreground">Fahmi Store</p>
            <p className="text-sm text-muted-foreground mt-1">Premium products. Clean experience.</p>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/products" className="hover:text-foreground">Products</Link>
            <Link href="/cart" className="hover:text-foreground">Cart</Link>
            <Link href="/login" className="hover:text-foreground">Account</Link>
          </div>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">© {new Date().getFullYear()} Fahmi Store</p>
      </div>
    </footer>
  );
}
