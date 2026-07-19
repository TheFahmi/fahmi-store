'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, type User } from './api';

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fs-user');
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const rows = await api.login(username, password);
    if (!rows || rows.length === 0) throw new Error('Username atau password salah');
    const u = rows[0];
    setUser(u);
    localStorage.setItem('fs-user', JSON.stringify(u));
    if ((u as any).token) localStorage.setItem('token', (u as any).token);
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    await api.register(username, email, password);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('fs-user');
    localStorage.removeItem('token');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
