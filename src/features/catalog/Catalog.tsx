"use client";

import { ArrowLeft } from "lucide-react";
import { businessTypes } from "@/data/businesses";
import { applyPriceOverrides, getProductsForFilter } from "@/services/product.service";
import { usePricesStore } from "@/store/prices.store";
import { useUIStore } from "@/store/ui.store";
import { ProductCard } from "./ProductCard";

const titleByFilter = {
  all: "Catálogo completo",
  business: (value: string) =>
    businessTypes.find((b) => b.id === value)?.label ?? "Catálogo",
  protein: (value: string) => `Categoría: ${value[0].toUpperCase()}${value.slice(1)}`,
};

export function Catalog() {
  const activeFilter = useUIStore((s) => s.activeFilter);
  const clearFilter = useUIStore((s) => s.clearFilter);
  const priceOverrides = usePricesStore((s) => s.overrides);
  const availability = usePricesStore((s) => s.availability);
  const patches = usePricesStore((s) => s.patches);
  const newProducts = usePricesStore((s) => s.newProducts);
  const hiddenSkus = usePricesStore((s) => s.hiddenSkus);
  const visibleSkus = usePricesStore((s) => s.visibleSkus);
  const products = applyPriceOverrides(
    getProductsForFilter(activeFilter, newProducts),
    priceOverrides,
    availability,
    patches,
    hiddenSkus,
    visibleSkus,
  );

  const title =
    activeFilter.type === "all"
      ? titleByFilter.all
      : activeFilter.type === "business"
        ? titleByFilter.business(activeFilter.value)
        : titleByFilter.protein(activeFilter.value);

  return (
    <section id="catalogo" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {activeFilter.type !== "all" ? (
            <button
              type="button"
              onClick={clearFilter}
              aria-label="Volver a productos destacados"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white transition hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : null}
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>

        {activeFilter.type !== "all" ? (
          <button
            type="button"
            onClick={clearFilter}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Ver todo
          </button>
        ) : null}
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[20px] border border-white/[0.06] bg-surface p-10 text-center">
          <p className="text-white">
            En este momento no tenemos productos disponibles para esta categoría.
          </p>
          <p className="text-sm text-muted">
            Nuestro equipo está actualizando el inventario. Si necesitas ayuda, escríbenos por
            WhatsApp.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.sku} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
