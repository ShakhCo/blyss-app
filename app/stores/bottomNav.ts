import { create } from "zustand";

interface BottomNavState {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
}

export const useBottomNavStore = create<BottomNavState>((set) => ({
  isVisible: true,
  show: () => set({ isVisible: true }),
  hide: () => set({ isVisible: false }),
  toggle: () => set((state) => ({ isVisible: !state.isVisible })),
}));

// Convenience functions for imperative usage
export const bottomNav = {
  show: () => useBottomNavStore.getState().show(),
  hide: () => useBottomNavStore.getState().hide(),
  toggle: () => useBottomNavStore.getState().toggle(),
};
