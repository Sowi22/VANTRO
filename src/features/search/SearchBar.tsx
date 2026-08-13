"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { applyPriceOverrides, searchProducts } from "@/services/product.service";
import { usePricesStore } from "@/store/prices.store";
import { ProductCard } from "@/features/catalog/ProductCard";

interface SearchBarProps {
  autoFocus?: boolean;
  onResultSelected?: () => void;
}

export function SearchBar({ autoFocus, onResultSelected }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const priceOverrides = usePricesStore((s) => s.overrides);
  const availability = usePricesStore((s) => s.availability);
  const patches = usePricesStore((s) => s.patches);
  const newProducts = usePricesStore((s) => s.newProducts);
  const hiddenSkus = usePricesStore((s) => s.hiddenSkus);
  const visibleSkus = usePricesStore((s) => s.visibleSkus);
  const results = useMemo(
    () =>
      applyPriceOverrides(
        searchProducts(query, newProducts),
        priceOverrides,
        availability,
        patches,
        hiddenSkus,
        visibleSkus,
      ),
    [query, newProducts, priceOverrides, availability, patches, hiddenSkus, visibleSkus],
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-surface px-4 py-3">
        <Search className="h-5 w-5 shrink-0 text-muted" />
        <input
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="¿Qué producto estás buscando?"
          className="w-full bg-transparent text-white placeholder:text-muted focus:outline-none"
        />
      </div>

      {query.trim() ? (
        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          {results.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              No encontramos productos con ese nombre. Prueba escribiendo otra palabra.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {results.map((product) => (
                <ProductCard key={product.sku} product={product} onAdded={onResultSelected} />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
