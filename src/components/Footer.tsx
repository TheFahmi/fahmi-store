import Link from 'next/link';

const shopCats = [
  { label: 'Electronics', href: '/products?cat=1' },
  { label: 'Fashion', href: '/products?cat=2' },
  { label: 'Home & Living', href: '/products?cat=3' },
  { label: 'Sports', href: '/products?cat=4' },
  { label: 'Books', href: '/products?cat=5' },
];

const aboutLinks = [
  { label: 'About us', href: '/about' },
  { label: 'Careers', href: '/about' },
  { label: 'Press', href: '/about' },
  { label: 'Sustainability', href: '/about' },
];

const supportLinks = [
  { label: 'Help center', href: '/help' },
  { label: 'Track order', href: '/cart' },
  { label: 'Returns', href: '/help' },
  { label: 'Shipping info', href: '/help' },
  { label: 'Contact', href: '/help' },
];

function Twitter() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zM17.083 19.77h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function Instagram() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function Facebook() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v6h3v-6h3l1-3h-4v-2c0-.6.4-1 1-1z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#1d1d1f] text-[#f5f5f7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {/* Shop */}
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-white/50 mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {shopCats.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[13px] text-white/80 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
              <li><Link href="/products" className="text-[13px] text-white/80 hover:text-white">All products</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-white/50 mb-4">About</h4>
            <ul className="space-y-2.5">
              {aboutLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[13px] text-white/80 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-white/50 mb-4">Support</h4>
            <ul className="space-y-2.5">
              {supportLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[13px] text-white/80 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-white/50 mb-4">Newsletter</h4>
            <p className="text-[13px] text-white/70 mb-3">Get deals & new arrivals.</p>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email address"
                className="w-full h-9 px-3 rounded-lg bg-white/10 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/60 border border-white/10"
              />
              <button
                type="submit"
                className="h-9 rounded-lg bg-[#0071e3] hover:bg-[#0077ed] text-white text-[13px] font-medium transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-[#0071e3] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path d="M6 6h15l-1.5 9h-12z" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /><path d="M6 6L5 3H2" />
              </svg>
            </span>
            <p className="text-[13px] text-white/60">&copy; {new Date().getFullYear()} Fahmi Store. All rights reserved.</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Social */}
            <div className="flex items-center gap-2">
              <a href="#" aria-label="Twitter" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                <Twitter />
              </a>
              <a href="#" aria-label="Instagram" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                <Instagram />
              </a>
              <a href="#" aria-label="Facebook" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                <Facebook />
              </a>
            </div>

            {/* Payments */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-white/10 text-white tracking-wider">VISA</span>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-white/10 text-white tracking-wider">MC</span>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-white/10 text-white tracking-wider">PayPal</span>
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-white/40">
          <Link href="/privacy" className="hover:text-white/80">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white/80">Terms of Service</Link>
          <Link href="/cookies" className="hover:text-white/80">Cookie Policy</Link>
          <Link href="/sitemap" className="hover:text-white/80">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}
