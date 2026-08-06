export type CommercialLine =
  | "restaurante"
  | "comida-rapida"
  | "premium"
  | "hamburguesas"
  | "fitness"
  | "hogar"
  | "complementos";

export type BusinessSegment =
  | "comida-rapida"
  | "restaurante"
  | "asadero"
  | "hogar"
  | "fitness";

export type ProteinCategory = "res" | "pollo" | "cerdo" | "complemento" | "mixto";

export type ProductStatus = "activo" | "agotado" | "proximamente" | "pendiente";

/**
 * Tipo de venta del producto. "ambos" identifica productos que se venden
 * por peso y por unidad a la vez (ej. un corte que también se vende
 * porcionado en unidades). No condiciona el render: cada presentación ya
 * declara su propio `weightGrams` (o no), así que un producto "ambos"
 * simplemente combina presentaciones de los dos tipos en `presentations`.
 */
export type PresentationUnit = "peso" | "unidad" | "ambos";

export interface Presentation {
  /** Ej. "500 g", "1 kg", "Paquete x4 und" */
  label: string;
  /** Gramos, solo cuando esta presentación se vende por peso */
  weightGrams?: number;
  /** Precio final de esta presentación. Null cuando el precio está pendiente. */
  price: number | null;
  /**
   * Precio de referencia antes de descuento (opcional). Cuando existe y es
   * mayor que `price`, la UI puede mostrarlo tachado junto al precio actual
   * para señalar una promoción, sin requerir ningún otro cambio de código.
   */
  compareAtPrice?: number;
}

export interface Product {
  sku: string;
  name: string;
  slug: string;
  line: CommercialLine;
  proteinCategory: ProteinCategory;
  businessSegments: BusinessSegment[];
  /** Solo informativo/filtrable: qué tipo(s) de venta ofrece el producto. */
  unit: PresentationUnit;
  presentations: Presentation[];
  status: ProductStatus;
  featured: boolean;
  tags: string[];
  applications: string[];
  relatedSkus: string[];
  /**
   * Ruta de la fotografía real del producto (ej. "/products/carne-molida-premium.jpg"),
   * relativa a `public/`. Opcional: mientras no exista, la tarjeta sigue
   * mostrando el ícono de relleno por categoría (`MediaPlaceholder`), tal
   * como todos los productos actuales.
   */
  image?: string;
}

/**
 * Precio de una presentación tal como llega desde la fuente externa (hoy:
 * Google Sheet publicada como CSV). Vive en `types/` porque tanto la API
 * route que la produce (`app/api/prices`) como el servicio que la consume
 * (`services/product.service.ts`) y el store que la guarda
 * (`store/prices.store.ts`) comparten esta única definición.
 */
export interface PriceOverrideEntry {
  price: number | null;
  compareAtPrice?: number;
}

/** Clave: `${sku}__${presentationLabel}`. */
export type PriceOverrideMap = Record<string, PriceOverrideEntry>;

/**
 * Disponibilidad de un producto controlada desde la hoja de precios (columna
 * `disponible`), a nivel de SKU completo (no por presentación): si el dueño
 * marca "No" en cualquier fila de ese producto, se muestra "Agotado" en toda
 * la página sin tocar código. Marcar "Sí" reactiva un producto aunque en
 * `data/products.ts` esté definido como agotado. Clave: `sku`.
 */
export type AvailabilityOverrideMap = Record<string, boolean>;
