import { products, getProductBySku } from "@/data/products";
import type {
  AvailabilityOverrideMap,
  BusinessSegment,
  PriceOverrideMap,
  Product,
  ProductPatchMap,
  ProteinCategory,
} from "@/types/product.types";
import type { ActiveFilter } from "@/store/ui.store";

/**
 * Catálogo base más los productos creados desde la hoja de precios (sku que
 * no existe en `data/products.ts`). `extraProducts` viene vacío la mayoría
 * de las veces (nadie ha creado un producto nuevo desde la hoja), en cuyo
 * caso devolvemos directamente `products` sin copiar el arreglo.
 */
function withExtras(extraProducts: Product[]): Product[] {
  return extraProducts.length > 0 ? [...products, ...extraProducts] : products;
}

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.featured);
}

/**
 * Catálogo completo, con los productos destacados primero. Se usa como vista
 * por defecto (filtro "all") para que ningún producto quede oculto: antes
 * "all" mostraba únicamente los destacados (6 de 31 SKUs) y el resto solo
 * era visible filtrando por negocio, categoría o búsqueda.
 */
export function getAllProductsSorted(extraProducts: Product[] = []): Product[] {
  return [...withExtras(extraProducts)].sort((a, b) => Number(b.featured) - Number(a.featured));
}

export function getProductsByBusiness(segment: BusinessSegment, extraProducts: Product[] = []): Product[] {
  return withExtras(extraProducts).filter((product) => product.businessSegments.includes(segment));
}

export function getProductsByProtein(category: ProteinCategory, extraProducts: Product[] = []): Product[] {
  return withExtras(extraProducts).filter((product) => product.proteinCategory === category);
}

export function searchProducts(query: string, extraProducts: Product[] = []): Product[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return withExtras(extraProducts).filter((product) =>
    [product.name, product.line, ...product.tags, ...product.applications]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}

/**
 * `extraProducts`: productos creados desde la hoja de precios (sku que no
 * existía en `data/products.ts`). Se incluyen en cualquier filtro, igual
 * que los productos del catálogo base.
 */
export function getProductsForFilter(filter: ActiveFilter, extraProducts: Product[] = []): Product[] {
  if (filter.type === "business") return getProductsByBusiness(filter.value, extraProducts);
  if (filter.type === "protein") return getProductsByProtein(filter.value, extraProducts);
  return getAllProductsSorted(extraProducts);
}

function overrideKey(sku: string, presentationLabel: string): string {
  return `${sku}__${presentationLabel}`;
}

/**
 * Aplica precios, disponibilidad y foto obtenidos de una fuente externa
 * (hoy: Google Sheet, vía `/api/prices`) sobre una lista de productos.
 * Nunca muta `data/products.ts`: devuelve copias nuevas solo para los
 * productos afectados.
 *
 * Reglas:
 * - Si un producto estaba "pendiente" o "proximamente" y llega un precio
 *   real desde la hoja, se reactiva automáticamente como "activo".
 * - Si la hoja marca `disponible = No` en cualquier fila de un SKU, ese
 *   producto se muestra como "agotado" en toda la página, sin importar su
 *   precio ni su estado en el código.
 * - Si la hoja marca `disponible = Sí`, reactiva un producto aunque en
 *   `data/products.ts` esté definido como agotado.
 * - Si la hoja trae una `imagen`, reemplaza el ícono de relleno por esa
 *   foto (funciona igual para productos del código y productos nuevos).
 *
 * Así, publicar, quitar, reactivar o ponerle foto a un producto es editar
 * una celda en la hoja de cálculo — nunca tocar código ni volver a desplegar.
 */
export function applyPriceOverrides(
  productList: Product[],
  overrides: PriceOverrideMap,
  availability: AvailabilityOverrideMap = {},
  patches: ProductPatchMap = {},
): Product[] {
  const hasPriceOverrides = Object.keys(overrides).length > 0;
  const hasAvailabilityOverrides = Object.keys(availability).length > 0;
  const hasPatches = Object.keys(patches).length > 0;
  if (!hasPriceOverrides && !hasAvailabilityOverrides && !hasPatches) return productList;

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

    let image = product.image;
    const patch = patches[product.sku];
    if (patch?.image) {
      image = patch.image;
      changed = true;
    }

    if (!changed) return product;
    return { ...product, presentations, status, image };
  });
}

export function getRelatedProducts(product: Product): Product[] {
  return product.relatedSkus
    .map((sku) => getProductBySku(sku))
    .filter((p): p is Product => Boolean(p));
}

export { getProductBySku };
