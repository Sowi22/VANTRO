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
 * (Res, Pollo, Cerdo, Vísceras, …). Las categorías sin productos no se
 * muestran: nada de secciones vacías.
 */
export function groupByCategory(catalog: Product[]): CatalogSection[] {
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
      };
    })
    .filter((section) => section.products.length > 0);
}
