import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface StoreState {
  storeName: string;
  user: User | null;
  updateStoreName: (newStoreName: string) => void;
  setUser: (user: User | null) => void;
}

export const useStore = create<StoreState>((set) => ({
  storeName: import.meta.env.VITE_DEFAULT_STORE || localStorage.getItem('store') || '',
  user: null,
  updateStoreName: (newStoreName) => {
    if (!import.meta.env.VITE_DEFAULT_STORE) {
      localStorage.setItem('store', newStoreName);
      set({ storeName: newStoreName });
    }
  },
  setUser: (user) => set({ user }),
})); 