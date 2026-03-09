import { create } from 'zustand';
import Cookies from 'js-cookie';

interface AuthState {
  token: string | null;
  merchant: { id: string; name: string; email: string } | null;
  setAuth: (token: string, merchant: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? Cookies.get('token') || null : null,
  merchant: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('merchant') || 'null') : null,
  setAuth: (token, merchant) => {
    Cookies.set('token', token, { expires: 1 });
    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant', JSON.stringify(merchant));
    }
    set({ token, merchant });
  },
  logout: () => {
    Cookies.remove('token');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('merchant');
    }
    set({ token: null, merchant: null });
  },
}));
