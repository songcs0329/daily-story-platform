import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from 'shared';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoggedIn: false,
      login: (user, accessToken) => set({ user, accessToken, isLoggedIn: true }),
      logout: () => set({ user: null, accessToken: null, isLoggedIn: false }),
    }),
    { name: 'auth-storage' },
  ),
);

export default useAuthStore;
