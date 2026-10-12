"use client";

import { createContext, useContext, useEffect } from "react";
import type { PriceSheetData } from "@/lib/price-sheet";
import { usePricesStore } from "@/store/prices.store";

const SYNC_INTERVAL_MS = 3 * 60 * 1000; // 3 minutos

const InitialPriceDataContext = createContext<PriceSheetData | null>(null);

/** Hoja de precios leída en el servidor para esta página (o null). */
export function useInitialPriceData() {
  return useContext(InitialPriceDataContext);
}

/**
 * Recibe la hoja ya leída en el servidor y la pone a disposición del
 * catálogo por contexto: así el HTML llega con los productos y precios
 * reales, sin mostrar el catálogo base y luego cambiarlo. Después la copia
 * al store y sincroniza cada 3 minutos para quien deja la pestaña abierta.
 */
export function PriceSync({
  initialData,
  children,
}: {
  initialData: PriceSheetData;
  children: React.ReactNode;
}) {
  const hydrate = usePricesStore((s) => s.hydrate);
  const fetchPrices = usePricesStore((s) => s.fetchPrices);

  useEffect(() => {
    hydrate(initialData);
    const interval = window.setInterval(fetchPrices, SYNC_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [initialData, hydrate, fetchPrices]);

  return (
    <InitialPriceDataContext.Provider value={initialData}>{children}</InitialPriceDataContext.Provider>
  );
}
