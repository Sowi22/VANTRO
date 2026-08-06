import { create } from "zustand";
import type { BusinessSegment, ProteinCategory } from "@/types/product.types";

export type ActiveFilter =
  | { type: "all" }
  | { type: "business"; value: BusinessSegment }
  | { type: "protein"; value: ProteinCategory };

interface UIState {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;

  isMenuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;

  searchQuery: string;
  setSearchQuery: (value: string) => void;

  activeFilter: ActiveFilter;
  setBusinessFilter: (value: BusinessSegment) => void;
  setProteinFilter: (value: ProteinCategory) => void;
  clearFilter: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),

  isMenuOpen: false,
  toggleMenu: () => set((s) => ({ isMenuOpen: !s.isMenuOpen })),
  closeMenu: () => set({ isMenuOpen: false }),

  searchQuery: "",
  setSearchQuery: (value) => set({ searchQuery: value }),

  activeFilter: { type: "all" },
  setBusinessFilter: (value) => set({ activeFilter: { type: "business", value } }),
  setProteinFilter: (value) => set({ activeFilter: { type: "protein", value } }),
  clearFilter: () => set({ activeFilter: { type: "all" } }),
}));
