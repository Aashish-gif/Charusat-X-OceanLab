import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => {
        set({ token, user, isAuthenticated: true });
        // Store token in localStorage for API requests
        localStorage.setItem('token', token);
      },
      clearAuth: () => {
        set({ token: null, user: null, isAuthenticated: false });
        localStorage.removeItem('token');
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        // Sync token to localStorage on rehydration
        if (state?.token) {
          localStorage.setItem('token', state.token);
        }
      },
    }
  )
);
