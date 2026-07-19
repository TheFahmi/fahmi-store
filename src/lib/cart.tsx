'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, type CartItem, type Product } from './api';
import { useAuth } from './auth';

type CartCtx = {
  items: CartItem[];
  count: number;
  loading: boolean;
  refresh: () => Promise<void>;
  add: (product: Product, qty?: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
  setQty: (id: number, qty: number) => Promise<void>;
};

const CartContext = createContext<CartCtx>({
  items: [],
  count: 0,
  loading: false,
  refresh: async () => {},
  add: async () => {},
  remove: async () => {},
  setQty: async () => {},
});

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.username) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.getCart(user.username);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.username]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (product: Product, qty = 1) => {
      if (!user) throw new Error('Login dulu');
      await api.addToCart(user.id, product.id, qty, product.harga * qty);
      await refresh();
    },
    [user, refresh]
  );

  const remove = useCallback(
    async (id: number) => {
      await api.deleteCart(id);
      await refresh();
    },
    [refresh]
  );

  const setQty = useCallback(
    async (id: number, qty: number) => {
      if (qty < 1) {
        await remove(id);
        return;
      }
      await api.updateCart(id, qty);
      await refresh();
    },
    [remove, refresh]
  );

  const count = items.reduce((s, i) => s + (Number(i.kuantiti) || Number(i.qty) || 0), 0);

  return (
    <CartContext.Provider value={{ items, count, loading, refresh, add, remove, setQty }}>
      {children}
    </CartContext.Provider>
  );
}
