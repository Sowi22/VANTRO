import { products, getProductBySku } from "@/data/products";
import type {
  AvailabilityOverrideMap,
  BusinessSegment,
  PriceOverrideMap,
  Product,
  ProteinCategory,
} from "@/types/product.types";
import type { ActiveFilter } from "@/store/ui.store";

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.featured);
}

/**
 * Catálogo completo, con los productos destacados primero. Se usa como vista
 * por defecto (filtro "all") para que ningún producto quede oculto: antes
 * "all" mostraba únicamente los destacados (6 de 31 SKUs) y el resto solo
 * era visible filtrando por negocio, categoría o búsqueda.
 */
export function getAllProductsSorted(): Product[] {
  return [...products].sort((a, b) => Number(b.featured) - Number(a.featured));
}

export function getProductsByBusiness(segment: BusinessSegment): Product[] {
  return products.filter((product) => product.businessSegments.includes(segment));
}

export function getProductsByProtein(category: ProteinCategory): Product[] {
  return products.filter((product) => product.proteinCategory === category);
}

export function searchProducts(query: string): Product[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return products.filter((product) =>
    [product.name, product.line, ...product.tags, ...product.applications]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}

export function getProductsForFilter(filter: ActiveFilter): Product[] {
  if (filter.type === "business") return getProductsByBusiness(filter.value);
  if (filter.type === "protein") return getProductsByProtein(filter.value);
  return getAllProductsSorted();
}

function overrideKey(sku: string, presentationLabel: string): string {
  return `${sku}__${presentationLabel}`;
}

/**
 * Aplica precios y disponibilidad obtenidos de una fuente externa (hoy:
 * Google Sheet, vía `/api/prices`) sobre el catálogo base. Nunca muta
 * `data/products.ts`: devuelve copias nuevas solo para los productos
 * afectados.
 *
 * Reglas:
 * - Si un producto estaba "pendiente" o "proximamente" y llega un precio
 *   real desde la hoja, se reactiva automáticamente como "activo".
 * - Si la hoja marca `disponible = No` en cualquier fila de un SKU, ese
 *   producto se muestra como "agotado" en toda la página, sin importar su
 *   precio ni su estado en el código.
 * - Si la hoja marca `disponible = Sí`, reactiva un producto aunque en
 *   `data/products.ts` esté definido como agotado.
 *
 * Así, publicar, quitar o reactivar un producto es editar una celda en la
 * hoja de cálculo — nunca tocar código ni volver a desplegar.
 */
export function applyPriceOverrides(
  productList: Product[],
  overrides: PriceOverrideMap,
  availability: AvailabilityOverrideMap = {},
): Product[] {
  const hasPriceOverrides = Object.keys(overrides).length > 0;
  const hasAvailabilityOverrides = Object.keys(availability).length > 0;
  if (!hasPriceOverrides && !hasAvailabilityOverrides) return productList;

  return productList.map((product) => {
    let changed = false;

    const presentations = product.presentations.map((presentation) => {
      const override = overrides[overrideKey(product.sku, presentation.label)];
      if (!override) return presentation;
      changed = true;
      return {
        ...presentation,
        price: override.price,
        compareAtPrice: override.compareAtPrice,
      };
    });

    let status = product.status;
    if (changed) {
      const hasRealPrice = presentations.some((p) => p.price != null);
      if ((status === "pendiente" || status === "proximamente") && hasRealPrice) {
        status = "activo";
      }
    }

    const availabilityOverride = availability[product.sku];
    if (availabilityOverride === false) {
      status = "agotado";
      changed = true;
    } else if (availabilityOverride === true && status === "agotado") {
      status = "activo";
      changed = true;
    }

    if (!changed) return product;
    return { ...product, presentations, status };
  });
}

export function getRelatedProducts(product: Product): Product[] {
  return product.relatedSkus
    .map((sku) => getProductBySku(sku))
    .filter((p): p is Product => Boolean(p));
}

export { getProductBySku };
