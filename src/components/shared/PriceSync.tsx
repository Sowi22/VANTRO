"use client";

import { useEffect } from "react";
import { usePricesStore } from "@/store/prices.store";

const SYNC_INTERVAL_MS = 3 * 60 * 1000; // 3 minutos

/**
 * Componente sin render: sincroniza los precios al cargar la página y cada
 * 3 minutos mientras el catálogo sigue abierto, para que un cliente que deja
 * la pestaña abierta vea precios actualizados sin recargar manualmente.
 */
export function PriceSync() {
  const fetchPrices = usePricesStore((s) => s.fetchPrices);

  useEffect(() => {
    fetchPrices();
    const interval = window.setInterval(fetchPrices, SYNC_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [fetchPrices]);

  return null;
}
