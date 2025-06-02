import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  isDemo: boolean;
  setDemoMode: (isDemo: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isDemo: false,
      setDemoMode: (isDemo) => set({ isDemo }),
    }),
    {
      name: 'auth-store',
    }
  )
); 