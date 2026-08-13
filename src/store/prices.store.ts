import { create } from "zustand";
import type {
  AvailabilityOverrideMap,
  PriceOverrideMap,
  Product,
  ProductPatchMap,
} from "@/types/product.types";

interface PricesState {
  overrides: PriceOverrideMap;
  availability: AvailabilityOverrideMap;
  patches: ProductPatchMap;
  newProducts: Product[];
  hiddenSkus: string[];
  status: "idle" | "loading" | "ready" | "error";
  lastSyncedAt: number | null;
  fetchPrices: () => Promise<void>;
}

/**
 * Precios, disponibilidad, fotos, renombrados y productos nuevos
 * sincronizados desde `/api/prices` (Google Sheet). No se persiste en
 * localStorage a propósito: en cada visita se pide la versión más reciente.
 * Si la sincronización falla, todo queda vacío y el catálogo simplemente
 * usa los datos de `data/products.ts`.
 */
export const usePricesStore = create<PricesState>((set) => ({
  overrides: {},
  availability: {},
  patches: {},
  newProducts: [],
  hiddenSkus: [],
  status: "idle",
  lastSyncedAt: null,

  fetchPrices: async () => {
    set({ status: "loading" });
    try {
      const res = await fetch("/api/prices", { cache: "no-store" });
      const data = (await res.json()) as {
        overrides?: PriceOverrideMap;
        availability?: AvailabilityOverrideMap;
        patches?: ProductPatchMap;
        newProducts?: Product[];
        hiddenSkus?: string[];
      };
      set({
        overrides: data.overrides ?? {},
        availability: data.availability ?? {},
        patches: data.patches ?? {},
        newProducts: data.newProducts ?? [],
        hiddenSkus: data.hiddenSkus ?? [],
        status: "ready",
        lastSyncedAt: Date.now(),
      });
    } catch (error) {
      console.error("No se pudieron sincronizar los precios de VANTRO:", error);
      set({ status: "error" });
    }
  },
}));
