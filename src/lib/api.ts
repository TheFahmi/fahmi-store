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
  nama: string;
  harga: number;
  image?: string | null;
  qty: number;
  total?: number;
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
  addToCart: (payload: Record<string, unknown>) =>
    request<unknown>('/cartplus/cartplus', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateCart: (id: number, payload: Record<string, unknown>) =>
    request<unknown>(`/editcart/editcart/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
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
};

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
