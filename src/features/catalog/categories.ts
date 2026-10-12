import { proteinCategories } from "@/data/businesses";
import type { Product, ProteinCategory } from "@/types/product.types";

const extraLabels: Record<string, string> = {
  complemento: "Complementos",
  mixto: "Combos",
};

export interface CatalogSection {
  id: string;
  label: string;
  description?: string;
  products: Product[];
}

export const FEATURED_SECTION_ID = "destacados";

export function sectionId(category: ProteinCategory) {
  return `cat-${category}`;
}

/**
 * Agrupa el catálogo por categoría de proteína en el orden del CMS
 * (Res, Pollo, Cerdo, Vísceras, …). Las cuatro categorías principales
 * siempre aparecen (aunque estén vacías) para que la navegación sea
 * estable; las extra (complementos, combos) solo si tienen productos.
 */
export function groupByCategory(catalog: Product[]): CatalogSection[] {
  const main = new Set<ProteinCategory>(proteinCategories.map((c) => c.id));
  const order: ProteinCategory[] = [
    ...proteinCategories.map((c) => c.id),
    "complemento",
    "mixto",
  ];
  return order
    .map((id) => {
      const meta = proteinCategories.find((c) => c.id === id);
      return {
        id: sectionId(id),
        label: meta?.label ?? extraLabels[id] ?? id,
        description: meta?.description,
        products: catalog.filter((p) => p.proteinCategory === id),
        main: main.has(id),
      };
    })
    .filter((section) => section.main || section.products.length > 0)
    .map(({ main: _main, ...section }) => section);
}
