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

export type ProteinCategory = "res" | "pollo" | "cerdo" | "visceras" | "complemento" | "mixto";

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
   * Fotografía real del producto: una ruta local ("/products/archivo.jpg",
   * dentro de `public/`) o una URL completa (ej. un link de imgur/Drive
   * pegado en la columna `imagen` de la hoja de precios). Opcional: mientras
   * no exista, la tarjeta muestra el ícono de relleno por categoría
   * (`MediaPlaceholder`), tal como todos los productos actuales.
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

/**
 * Parche por SKU para campos de producto que no son de precio/disponibilidad
 * (foto, nombre, categoría, negocios, tipo de venta). Se aplica sobre
 * productos ya existentes en `data/products.ts`: permite, por ejemplo,
 * reutilizar un SKU viejo para un corte completamente distinto sin tocar
 * código — la hoja manda sobre el nombre y la categoría, no solo el precio.
 * Clave: `sku`.
 */
export interface ProductPatch {
  image?: string;
  name?: string;
  proteinCategory?: ProteinCategory;
  businessSegments?: BusinessSegment[];
  unit?: PresentationUnit;
  /**
   * Cuando está presente, REEMPLAZA por completo las presentaciones del
   * producto (no se combina con las del código). Así, si la hoja solo trae
   * "500 g" para un producto que en el código tenía 500 g/1 kg/2 kg/Granel,
   * en la página solo se muestra "500 g" — las demás dejan de existir hasta
   * que se agreguen de vuelta en la hoja.
   */
  presentations?: Presentation[];
}
export type ProductPatchMap = Record<string, ProductPatch>;
