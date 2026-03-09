import { create } from 'zustand';

interface AppState {
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
}));
