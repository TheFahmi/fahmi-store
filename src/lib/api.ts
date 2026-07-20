const API = process.env.NEXT_PUBLIC_API_URL || '';

export type Product = {
  id: number;
  nama: string;
  harga: number;
  image: string | null;
  deskripsi: string;
  stok: number;
  rating: number;
  idcategory?: number;
  namacategory?: string;
  idcat?: number;
};

export type Category = {
  id: number;
  nama: string;
};

export type User = {
  id: number;
  username: string;
  role: string;
  email: string;
  status?: string;
  alamat?: string;
  phone?: string;
};

export type CartItem = {
  id: number;
  idproduct?: number;
  Nama_product?: string;
  nama?: string;
  harga: number;
  image?: string | null;
  kuantiti?: number;
  qty?: number;
  Username?: string;
  username?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getHomeProducts: () => request<Product[]>('/product/getproducthome'),
  getProducts: () => request<Product[]>('/product/getproducts'),
  getCategories: () => request<Category[]>('/category/getcategory'),
  getProduct: (id: number | string) =>
    request<Product[]>(`/productdetail/productdetail?id=${id}`).then((d) => d[0]),
  login: (username: string, password: string) =>
    request<User[]>('/user/user', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  register: (username: string, email: string, password: string) =>
    request<unknown>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),
  getCart: (username: string) =>
    request<CartItem[]>(`/cart/cart?username=${encodeURIComponent(username)}`),
  addToCart: (user_id: number, product_id: number, kuantiti: number, total_harga: number) =>
    request<unknown>('/cartplus/cartplus', {
      method: 'POST',
      body: JSON.stringify({ user_id, product_id, kuantiti, total_harga }),
    }),
  updateCart: (id: number, kuantiti: number) =>
    request<unknown>(`/editcart/editcart/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ kuantiti }),
    }),
  deleteCart: (id: number) =>
    request<unknown>(`/deletecart/deletecart/${id}`, { method: 'DELETE' }),
  getWishlist: (username: string) =>
    request<unknown[]>(`/wishlist/getprotectwishlist?username=${encodeURIComponent(username)}`),
  addWishlist: (payload: Record<string, unknown>) =>
    request<unknown>('/wishlist/addwishlist', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // ─── Checkout flow ───────────────────────────────────────────────────
  // Note: backend routes are mounted at /cart/* on :2002 and proxied through
  // Next.js rewrites (see next.config.ts). Use relative paths.
  createOrder: (payload: {
    username: string;
    date: string;
    subtotal: number;
    totalquantity: number;
    invoice: string;
    status: string;
    email: string;
    waktuexp: string;
    totalpotongan: number;
  }) =>
    request<{ insertId: number }>('/cart/listorder', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  createOrderDetail: (payload: { idtrx: number; idproduct: number; qty: number; totalprice: number }) =>
    request<unknown>('/cart/detailorder', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  uploadPayment: (formData: FormData) =>
    fetch('/cart/confirmorder', { method: 'POST', body: formData }).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }),
  // ─── Admin: orders ───────────────────────────────────────────────────
  getAllOrders: () => request<OrderRow[]>('/cart/getdaftarorder'),
  getJoinedOrders: () => request<JoinedOrder[]>('/cart/joindaftarorder'),
  getConfirmations: () => request<Confirmation[]>('/cart/getconfirm'),
  updateOrderStatus: (id: number, status: string) =>
    request<unknown>(`/cart/editadmin/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  deleteOrder: (invoice: string) =>
    request<unknown>(`/cart/deleteorderbyadmin/${encodeURIComponent(invoice)}`, { method: 'DELETE' }),
  getPromos: () => request<Promo[]>('/cart/getallpromo'),
  // ─── Admin: products ─────────────────────────────────────────────────
  adminGetProducts: () => request<Product[]>('/product/getproducts'),
  adminGetCategories: () => request<Category[]>('/product/getcategory'),
  deleteProduct: (id: number) =>
    request<unknown>(`/product/deleteproduct/${id}`, { method: 'DELETE' }),
  updateProduct: (id: number, payload: Record<string, unknown>) =>
    request<unknown>(`/product/editproduct/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  addProduct: (formData: FormData) =>
    fetch('/product/addproduct', { method: 'POST', body: formData }).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }),
};

export type OrderRow = {
  id: number;
  username: string;
  date: string;
  subtotal: number;
  totalquantity: number;
  invoice: string;
  status: string;
  email: string;
  waktuexp: string;
  totalpotongan: number;
};

export type JoinedOrder = OrderRow & {
  idproduct?: number;
  qty?: number;
  totalprice?: number;
  nama?: string;
  alamat?: string;
  phone?: string;
};

export type Confirmation = {
  id: number;
  username: string;
  invoice: string;
  image: string;
};

export type Promo = {
  id: number;
  code: string;
  discount: number;
  [k: string]: unknown;
};

export const ORDER_STATUS = [
  'unpaid',
  'waiting_confirmation',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
  'expired',
] as const;
export type OrderStatus = (typeof ORDER_STATUS)[number];

export function statusLabel(s: string): string {
  return s
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function statusColor(s: string): { bg: string; fg: string } {
  switch (s) {
    case 'unpaid':
      return { bg: '#86868b', fg: '#ffffff' };
    case 'waiting_confirmation':
      return { bg: '#f59e0b', fg: '#1d1d1f' };
    case 'confirmed':
      return { bg: '#0071e3', fg: '#ffffff' };
    case 'shipped':
      return { bg: '#5ac8fa', fg: '#1d1d1f' };
    case 'delivered':
      return { bg: '#34c759', fg: '#ffffff' };
    case 'cancelled':
      return { bg: '#ff3b30', fg: '#ffffff' };
    case 'expired':
      return { bg: '#1d1d1f', fg: '#f5f5f7' };
    default:
      return { bg: '#86868b', fg: '#ffffff' };
  }
}

export function generateInvoice(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ts =
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds());
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INV-${ts}-${rand}`;
}

export function paymentDeadline(): string {
  return toMySQLDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
}

export function toMySQLDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function nowMySQL(): string {
  return toMySQLDate(new Date());
}

export function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n || 0);
}

// Category accent colors (solid, no gradients)
const CAT_COLORS: Record<number, { bg: string; fg: string }> = {
  1: { bg: '#1d1d1f', fg: '#f5f5f7' }, // Electronics
  2: { bg: '#0a84ff', fg: '#ffffff' }, // Fashion
  3: { bg: '#f59e0b', fg: '#1d1d1f' }, // Home & Living
  4: { bg: '#30d158', fg: '#1d1d1f' }, // Sports
  5: { bg: '#0071e3', fg: '#ffffff' }, // Books
};

export function productImage(image: string | null | undefined, name?: string, idcat?: number) {
  if (image) {
    if (image.startsWith('http')) return image;
    return `${API}/products/${image}`;
  }
  // Generate inline SVG placeholder with product name + category color
  const colors = CAT_COLORS[idcat || 0] || { bg: '#1d1d1f', fg: '#f5f5f7' };
  const label = (name || 'Product').slice(0, 20);
  const lines = label.split(' ');
  const line1 = lines.slice(0, Math.ceil(lines.length / 2)).join(' ');
  const line2 = lines.slice(Math.ceil(lines.length / 2)).join(' ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
<rect width="600" height="600" fill="${colors.bg}"/>
<text x="300" y="${line2 ? '280' : '310'}" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="600" fill="${colors.fg}" text-anchor="middle">${escapeXml(line1)}</text>
${line2 ? `<text x="300" y="340" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="600" fill="${colors.fg}" text-anchor="middle">${escapeXml(line2)}</text>` : ''}
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(s: string) {
  return s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c] || c));
}
