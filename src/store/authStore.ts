import { create } from 'zustand';
import api from '../lib/axios';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

const storedToken = localStorage.getItem('bhansar_token');

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: storedToken,
  isAuthenticated: Boolean(storedToken),
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('bhansar_token', data.token);
    set({ token: data.token, user: data.user, isAuthenticated: true });
  },
  async logout() {
    await api.post('/auth/logout').catch(() => undefined);
    localStorage.removeItem('bhansar_token');
    set({ token: null, user: null, isAuthenticated: false });
  },
  setUser(user) {
    set({ user });
  },
  setToken(token) {
    if (token) localStorage.setItem('bhansar_token', token);
    else localStorage.removeItem('bhansar_token');
    set({ token, isAuthenticated: Boolean(token) });
  }
}));
