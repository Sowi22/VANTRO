import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/cart.types";

interface CartState {
  items: CartItem[];
  observations: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (sku: string, presentationLabel: string) => void;
  setQuantity: (sku: string, presentationLabel: string, quantity: number) => void;
  setObservations: (value: string) => void;
  setCustomerName: (value: string) => void;
  setCustomerPhone: (value: string) => void;
  setCustomerAddress: (value: string) => void;
  setPaymentMethod: (value: string) => void;
  clear: () => void;
  totalItems: () => number;
  totalEstimated: () => number;
}

function sameLine(a: CartItem, sku: string, presentationLabel: string) {
  return a.sku === sku && a.presentationLabel === presentationLabel;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      observations: "",
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      paymentMethod: "",

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) =>
            sameLine(i, item.sku, item.presentationLabel),
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item.sku, item.presentationLabel)
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        });
      },

      removeItem: (sku, presentationLabel) => {
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, sku, presentationLabel)),
        }));
      },

      setQuantity: (sku, presentationLabel, quantity) => {
        if (quantity <= 0) {
          get().removeItem(sku, presentationLabel);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            sameLine(i, sku, presentationLabel) ? { ...i, quantity } : i,
          ),
        }));
      },

      setObservations: (value) => set({ observations: value }),
      setCustomerName: (value) => set({ customerName: value }),
      setCustomerPhone: (value) => set({ customerPhone: value }),
      setCustomerAddress: (value) => set({ customerAddress: value }),
      setPaymentMethod: (value) => set({ paymentMethod: value }),

      clear: () =>
        set({
          items: [],
          observations: "",
          customerName: "",
          customerPhone: "",
          customerAddress: "",
          paymentMethod: "",
        }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalEstimated: () =>
        get().items.reduce(
          (sum, i) => sum + (i.unitPrice ?? 0) * i.quantity,
          0,
        ),
    }),
    {
      name: "vantro-centro-de-pedido",
      partialize: (state) => ({
        items: state.items,
        observations: state.observations,
        customerName: state.customerName,
        customerPhone: state.customerPhone,
        customerAddress: state.customerAddress,
        paymentMethod: state.paymentMethod,
      }),
    },
  ),
);
