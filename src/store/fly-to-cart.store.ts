import { create } from "zustand";

interface Point {
  x: number;
  y: number;
}

interface FlyItem {
  id: number;
  from: Point;
  to: Point;
}

interface FlyToCartState {
  items: FlyItem[];
  /** Lanza la animación desde `from` (posición del botón "Agregar" que se tocó) hasta el ícono del carrito. */
  launch: (from: Point) => void;
  remove: (id: number) => void;
}

let nextId = 0;

/**
 * Guarda las animaciones "volando al carrito" activas. Vive en su propio
 * store (no en `ui.store.ts`) porque `ProductCard` (donde nace la
 * animación) y `FlyToCartLayer` (donde se dibuja, montado una sola vez en
 * el layout) no tienen relación padre-hijo directa.
 */
export const useFlyToCartStore = create<FlyToCartState>((set) => ({
  items: [],

  launch: (from) => {
    const target = document.getElementById("cart-icon-target");
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const to = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const id = ++nextId;
    set((state) => ({ items: [...state.items, { id, from, to }] }));
  },

  remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
}));
