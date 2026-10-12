import { create } from "zustand";
import type {
  AvailabilityOverrideMap,
  PriceOverrideMap,
  Product,
  ProductPatchMap,
} from "@/types/product.types";
import type { PriceSheetData } from "@/lib/price-sheet";

interface PricesState {
  overrides: PriceOverrideMap;
  availability: AvailabilityOverrideMap;
  patches: ProductPatchMap;
  newProducts: Product[];
  hiddenSkus: string[];
  /**
   * `undefined` = no restringir (hoja no configurada, vacía o con error: se
   * muestra el catálogo completo de `data/products.ts`). Array = la hoja
   * sincronizó con éxito y define la lista completa de productos visibles.
   */
  visibleSkus: string[] | undefined;
  status: "idle" | "loading" | "ready" | "error";
  lastSyncedAt: number | null;
  fetchPrices: () => Promise<void>;
  /** Carga datos ya obtenidos (en el servidor o por `/api/prices`). */
  hydrate: (data: Partial<PriceSheetData>) => void;
}

/**
 * Precios, disponibilidad, fotos, renombrados, productos nuevos y la lista
 * de SKUs visibles, sincronizados desde `/api/prices` (Google Sheet). No se
 * persiste en localStorage a propósito: en cada visita se pide la versión
 * más reciente. Si la sincronización falla, todo queda vacío/sin restringir
 * y el catálogo simplemente usa los datos completos de `data/products.ts`.
 */
export type CatalogData = Pick<
  PricesState,
  "overrides" | "availability" | "patches" | "newProducts" | "hiddenSkus" | "visibleSkus"
>;

/** Normaliza la respuesta de la hoja al formato que usa el catálogo. */
export function toCatalogData(data: Partial<PriceSheetData>): CatalogData {
  const mentionedSkus = data.mentionedSkus ?? [];
  return {
    overrides: data.overrides ?? {},
    availability: data.availability ?? {},
    patches: data.patches ?? {},
    newProducts: data.newProducts ?? [],
    hiddenSkus: data.hiddenSkus ?? [],
    // Solo restringimos el catálogo cuando la hoja sincronizó de verdad
    // (source "sheet") y trajo al menos un sku — evita que un formato
    // roto o una hoja momentáneamente vacía vacíen todo el catálogo.
    visibleSkus: data.source === "sheet" && mentionedSkus.length > 0 ? mentionedSkus : undefined,
  };
}

export const usePricesStore = create<PricesState>((set) => ({
  overrides: {},
  availability: {},
  patches: {},
  newProducts: [],
  hiddenSkus: [],
  visibleSkus: undefined,
  status: "idle",
  lastSyncedAt: null,

  hydrate: (data) => set({ ...toCatalogData(data), status: "ready", lastSyncedAt: Date.now() }),

  fetchPrices: async () => {
    try {
      const res = await fetch("/api/prices", { cache: "no-store" });
      const data = (await res.json()) as Partial<PriceSheetData>;
      usePricesStore.getState().hydrate(data);
    } catch (error) {
      console.error("No se pudieron sincronizar los precios de VANTRO:", error);
      set({ status: "error" });
    }
  },
}));
