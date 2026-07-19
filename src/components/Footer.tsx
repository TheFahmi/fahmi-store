import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-black/5 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[17px] font-semibold tracking-tight text-foreground">Fahmi Store</p>
            <p className="text-[13px] text-muted-foreground mt-1">Premium products. Clean experience.</p>
          </div>
          <div className="flex gap-5 text-[13px] text-muted-foreground">
            <Link href="/products" className="hover:text-foreground">Products</Link>
            <Link href="/cart" className="hover:text-foreground">Cart</Link>
            <Link href="/login" className="hover:text-foreground">Account</Link>
          </div>
        </div>
        <p className="mt-8 text-[13px] text-muted-foreground">&copy; {new Date().getFullYear()} Fahmi Store. All rights reserved.</p>
      </div>
    </footer>
  );
}
