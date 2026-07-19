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

export function productImage(image: string | null | undefined, name?: string) {
  if (image) {
    if (image.startsWith('http')) return image;
    return `${API}/products/${image}`;
  }
  // placeholder with initials
  const label = encodeURIComponent((name || 'FS').slice(0, 12));
  return `https://placehold.co/600x600/e8e8ed/1d1d1f?text=${label}&font=system-ui`;
}
