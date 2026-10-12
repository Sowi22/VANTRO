import { create } from "zustand";

interface UIState {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;

  /** Buscador del encabezado (ícono de la lupa en el header). */
  isSearchOpen: boolean;
  closeSearch: () => void;
  toggleSearch: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),

  isSearchOpen: false,
  closeSearch: () => set({ isSearchOpen: false }),
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
}));
