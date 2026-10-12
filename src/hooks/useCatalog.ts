"use client";

import { useMemo } from "react";
import { applyPriceOverrides, getAllProductsSorted } from "@/services/product.service";
import { useShallow } from "zustand/react/shallow";
import { useInitialPriceData } from "@/components/shared/PriceSync";
import { toCatalogData, usePricesStore, type CatalogData } from "@/store/prices.store";
import type { Product } from "@/types/product.types";

/**
 * Catálogo visible completo (código + hoja de precios), con los productos
 * que tienen foto primero: son los que más invitan a comprar.
 */
export function useCatalog(): Product[] {
  const initial = useInitialPriceData();
  const synced = usePricesStore(
    useShallow((s) => ({
      lastSyncedAt: s.lastSyncedAt,
      overrides: s.overrides,
      availability: s.availability,
      patches: s.patches,
      newProducts: s.newProducts,
      hiddenSkus: s.hiddenSkus,
      visibleSkus: s.visibleSkus,
    })),
  );

  return useMemo(() => {
    // Antes de la primera sincronización en el navegador se usa la hoja
    // leída en el servidor: el primer render coincide con el HTML recibido.
    const data: CatalogData =
      synced.lastSyncedAt == null && initial ? toCatalogData(initial) : synced;
    const list = applyPriceOverrides(
      getAllProductsSorted(data.newProducts),
      data.overrides,
      data.availability,
      data.patches,
      data.hiddenSkus,
      data.visibleSkus,
    );
    return [...list].sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)));
  }, [initial, synced]);
}

/** Precio más bajo con descuento real (precio_anterior en la hoja), si existe. */
export function getBestOffer(product: Product) {
  return product.presentations.find(
    (p) => p.price != null && p.compareAtPrice != null && p.compareAtPrice > p.price,
  );
}

export function isPurchasable(product: Product) {
  return product.status === "activo" && product.presentations.some((p) => p.price != null);
}
