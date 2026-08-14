import { NextResponse } from "next/server";
import { parseCsv } from "@/lib/csv";
import { slugify } from "@/lib/slug";
import { products as baseProducts } from "@/data/products";
import type {
  AvailabilityOverrideMap,
  BusinessSegment,
  PresentationUnit,
  Presentation,
  PriceOverrideMap,
  Product,
  ProductPatchMap,
  ProteinCategory,
} from "@/types/product.types";

/**
 * Sincroniza precios, presentaciones, disponibilidad, fotos, renombrados y
 * productos nuevos desde una hoja de Google Sheets publicada como CSV
 * (Archivo → Compartir → Publicar en la Web → CSV, o compartida como
 * "cualquiera con el enlace" + URL `/export?format=csv`).
 *
 * Cada fila es UNA presentación. Varias filas con el mismo `sku` forman UN
 * solo producto con varias presentaciones (500 g / 1 kg / etc). Esto aplica
 * igual para un producto que ya existe en `data/products.ts` que para uno
 * completamente nuevo: en ambos casos, las presentaciones que aparecen en
 * la hoja para ese sku REEMPLAZAN por completo las presentaciones del
 * producto — no se combinan con las que tenía el código. Si en el código
 * "Atravesado" tenía 500 g/1 kg/2 kg/Granel y en la hoja solo pones una
 * fila de 500 g, en la página solo se ve esa.
 *
 * Columnas:
 * - sku, cantidad, precio, precio_anterior, disponible → como antes.
 * - disponible admite además "eliminar" / "oculto" / "ocultar" / "borrar":
 *   ese producto desaparece por completo del catálogo (no solo "Agotado").
 * - imagen, producto, categoria, negocios, tipo_venta (opcionales): se
 *   aplican como PARCHE tanto a productos existentes en `data/products.ts`
 *   (permite reutilizar un sku viejo para un corte distinto: cambia nombre,
 *   categoría, negocios y foto sin tocar código) como a productos nuevos
 *   (sku que no existía todavía).
 *
 * `mentionedSkus`: todo sku que aparece en al menos una fila de la hoja
 * (existente o nuevo). Cuando la hoja sincroniza con éxito, el catálogo
 * completo pasa a ser SOLO lo que está en `mentionedSkus` — cualquier
 * producto de `data/products.ts` que no tenga ninguna fila en la hoja se
 * deja de mostrar. Así, la hoja se convierte en la lista completa y
 * definitiva de productos, no solo en un parche de precios.
 *
 * Si `VANTRO_PRICES_SHEET_CSV_URL` no está configurada, o la hoja no
 * responde o está vacía, devolvemos todo vacío (incluido `mentionedSkus`)
 * — el catálogo sigue funcionando con los datos completos de
 * `src/data/products.ts`, sin restringir nada.
 */

function parsePrice(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/[^\d.-]/g, "");
  if (!cleaned) return undefined;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : undefined;
}

function parseWeightGrams(label: string): number | undefined {
  const match = label.match(/([\d.,]+)\s*(kg|g)\b/i);
  if (!match) return undefined;
  const value = parseFloat(match[1].replace(",", "."));
  if (!Number.isFinite(value)) return undefined;
  return /kg/i.test(match[2]) ? Math.round(value * 1000) : Math.round(value);
}

const NOT_AVAILABLE_VALUES = new Set(["no", "n", "false", "0", "agotado"]);
const AVAILABLE_VALUES = new Set(["si", "sí", "s", "yes", "true", "1", "disponible"]);
const HIDDEN_VALUES = new Set(["eliminar", "oculto", "ocultar", "borrar", "eliminado", "hide", "hidden"]);

type Availability = "hidden" | boolean | undefined;

/** `undefined` = la celda está vacía o no reconocida: no forzamos ningún cambio. */
function parseAvailability(raw: string | undefined): Availability {
  if (!raw) return undefined;
  const normalized = raw.trim().toLowerCase();
  if (HIDDEN_VALUES.has(normalized)) return "hidden";
  if (NOT_AVAILABLE_VALUES.has(normalized)) return false;
  if (AVAILABLE_VALUES.has(normalized)) return true;
  return undefined;
}

const VALID_CATEGORIES = new Set(["res", "pollo", "cerdo", "complemento", "mixto"]);
function parseProteinCategory(raw: string | undefined): ProteinCategory | undefined {
  const value = raw?.trim().toLowerCase();
  return value && VALID_CATEGORIES.has(value) ? (value as ProteinCategory) : undefined;
}

const VALID_SEGMENTS = new Set(["comida-rapida", "restaurante", "asadero", "hogar", "fitness"]);
function parseBusinessSegments(raw: string | undefined): BusinessSegment[] | undefined {
  if (!raw) return undefined;
  const parts = raw
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is BusinessSegment => VALID_SEGMENTS.has(s));
  return parts.length > 0 ? parts : undefined;
}

const VALID_UNITS = new Set(["peso", "unidad", "ambos"]);
function parseUnit(raw: string | undefined): PresentationUnit | undefined {
  const value = raw?.trim().toLowerCase();
  return value && VALID_UNITS.has(value) ? (value as PresentationUnit) : undefined;
}

/**
 * Si en la columna `imagen` pegan el link de una PÁGINA (ej. el álbum de
 * imgur.com/a/xxxx, en vez del link directo a la foto) en lugar de la
 * imagen directa, la resolvemos automáticamente: pedimos esa página y
 * leemos su etiqueta `og:image`, que casi todo sitio (imgur, Drive con
 * vista previa, etc.) usa para indicar cuál es la imagen "de portada". Así
 * no hace falta que el cliente entienda la diferencia entre "compartir
 * álbum" y "copiar dirección de la imagen".
 */
async function resolveImageUrl(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { redirect: "follow", signal: controller.signal });
    clearTimeout(timeout);

    const contentType = res.headers.get("content-type") || "";
    if (contentType.startsWith("image/")) return url;

    if (contentType.includes("text/html")) {
      const html = await res.text();
      const match =
        html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
      if (match?.[1]) return match[1];
    }
  } catch (error) {
    console.warn("No se pudo resolver la imagen de la hoja:", url, error);
  }
  return url;
}

interface SheetRow {
  name?: string;
  label: string;
  price?: number;
  compareAtPrice?: number;
  available?: Availability;
  image?: string;
  category?: ProteinCategory;
  segments?: BusinessSegment[];
  unit?: PresentationUnit;
}

function buildPresentations(rows: SheetRow[]): Presentation[] {
  return rows
    .filter((r) => r.label)
    .map((r) => ({
      label: r.label,
      weightGrams: parseWeightGrams(r.label),
      price: r.price ?? null,
      compareAtPrice: r.compareAtPrice,
    }));
}

/** Ensambla un producto completamente nuevo a partir de sus filas en la hoja. */
function buildNewProduct(sku: string, rows: SheetRow[]): Product {
  const name = rows.find((r) => r.name)?.name ?? sku;
  const image = rows.find((r) => r.image)?.image;
  const proteinCategory = rows.find((r) => r.category)?.category ?? "mixto";
  const businessSegments = rows.find((r) => r.segments)?.segments ?? [
    "comida-rapida",
    "restaurante",
    "asadero",
    "hogar",
    "fitness",
  ];
  const unit = rows.find((r) => r.unit)?.unit ?? "unidad";
  const forcedUnavailable = rows.some((r) => r.available === false);
  const forcedAvailable = rows.some((r) => r.available === true);

  const presentations = buildPresentations(rows);
  const hasRealPrice = presentations.some((p) => p.price != null);
  const status = forcedUnavailable ? "agotado" : hasRealPrice || forcedAvailable ? "activo" : "pendiente";

  return {
    sku,
    name,
    slug: slugify(name),
    line: "restaurante",
    proteinCategory,
    businessSegments,
    unit,
    presentations,
    status,
    featured: false,
    tags: [],
    applications: [],
    relatedSkus: [],
    image,
  };
}

export const revalidate = 60;

function emptyResponse(source: string) {
  return NextResponse.json({
    overrides: {} as PriceOverrideMap,
    availability: {} as AvailabilityOverrideMap,
    patches: {} as ProductPatchMap,
    newProducts: [] as Product[],
    hiddenSkus: [] as string[],
    mentionedSkus: [] as string[],
    source,
  });
}

export async function GET() {
  const sheetUrl = process.env.VANTRO_PRICES_SHEET_CSV_URL;

  if (!sheetUrl) return emptyResponse("not-configured");

  try {
    const res = await fetch(sheetUrl, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`La hoja respondió con estado ${res.status}`);

    const csvText = await res.text();
    const rows = parseCsv(csvText);
    if (rows.length < 2) return emptyResponse("sheet-empty");

    const header = rows[0].map((cell) => cell.trim().toLowerCase());
    const skuIdx = header.indexOf("sku");
    const nameIdx = header.indexOf("producto");
    const labelIdx = header.indexOf("cantidad") !== -1 ? header.indexOf("cantidad") : header.indexOf("presentacion");
    const priceIdx = header.indexOf("precio");
    const compareIdx = header.indexOf("precio_anterior");
    const availableIdx = header.indexOf("disponible");
    const imageIdx = header.indexOf("imagen");
    const categoryIdx = header.indexOf("categoria");
    const segmentsIdx = header.indexOf("negocios");
    const unitIdx = header.indexOf("tipo_venta");

    if (skuIdx === -1 || labelIdx === -1 || priceIdx === -1) {
      console.warn(
        "VANTRO_PRICES_SHEET_CSV_URL: la hoja no tiene las columnas esperadas (sku, cantidad, precio).",
      );
      return emptyResponse("sheet-bad-header");
    }

    const knownSkus = new Set(baseProducts.map((p) => p.sku));
    const hiddenSkus = new Set<string>();
    const mentionedSkus = new Set<string>();
    const skuRows = new Map<string, SheetRow[]>();

    for (const row of rows.slice(1)) {
      const sku = row[skuIdx]?.trim();
      const label = row[labelIdx]?.trim();
      if (!sku) continue;
      mentionedSkus.add(sku);

      const sheetRow: SheetRow = {
        name: nameIdx !== -1 ? row[nameIdx]?.trim() || undefined : undefined,
        label: label ?? "",
        price: parsePrice(row[priceIdx]),
        compareAtPrice: parsePrice(row[compareIdx]),
        available: parseAvailability(row[availableIdx]),
        image: imageIdx !== -1 ? row[imageIdx]?.trim() || undefined : undefined,
        category: categoryIdx !== -1 ? parseProteinCategory(row[categoryIdx]) : undefined,
        segments: segmentsIdx !== -1 ? parseBusinessSegments(row[segmentsIdx]) : undefined,
        unit: unitIdx !== -1 ? parseUnit(row[unitIdx]) : undefined,
      };

      if (sheetRow.available === "hidden") hiddenSkus.add(sku);

      const list = skuRows.get(sku) ?? [];
      list.push(sheetRow);
      skuRows.set(sku, list);
    }

    // Resuelve todos los links de imagen "de página" (álbumes, etc.) antes
    // de armar productos, una sola vez por link distinto (no por fila).
    const rawImageUrls = new Set<string>();
    for (const sheetRows of skuRows.values()) {
      for (const row of sheetRows) {
        if (row.image) rawImageUrls.add(row.image);
      }
    }
    if (rawImageUrls.size > 0) {
      const resolvedEntries = await Promise.all(
        Array.from(rawImageUrls).map(async (url) => [url, await resolveImageUrl(url)] as const),
      );
      const resolvedImages = new Map(resolvedEntries);
      for (const sheetRows of skuRows.values()) {
        for (const row of sheetRows) {
          if (row.image) row.image = resolvedImages.get(row.image) ?? row.image;
        }
      }
    }

    const availability: AvailabilityOverrideMap = {};
    const patches: ProductPatchMap = {};
    const newProducts: Product[] = [];

    for (const [sku, sheetRows] of skuRows) {
      if (hiddenSkus.has(sku)) continue;

      if (!knownSkus.has(sku)) {
        newProducts.push(buildNewProduct(sku, sheetRows));
        continue;
      }

      // SKU conocido: la hoja manda sobre presentaciones, precio,
      // disponibilidad y datos generales — puede reemplazar hasta el
      // nombre, la categoría y las presentaciones, para reutilizar un sku
      // viejo en un corte distinto sin tocar código.
      const forcedUnavailable = sheetRows.some((r) => r.available === false);
      const forcedAvailable = sheetRows.some((r) => r.available === true);
      if (forcedUnavailable) availability[sku] = false;
      else if (forcedAvailable) availability[sku] = true;

      const name = sheetRows.find((r) => r.name)?.name;
      const image = sheetRows.find((r) => r.image)?.image;
      const category = sheetRows.find((r) => r.category)?.category;
      const segments = sheetRows.find((r) => r.segments)?.segments;
      const unit = sheetRows.find((r) => r.unit)?.unit;

      patches[sku] = {
        presentations: buildPresentations(sheetRows),
        image,
        name,
        proteinCategory: category,
        businessSegments: segments,
        unit,
      };
    }

    return NextResponse.json({
      overrides: {} as PriceOverrideMap,
      availability,
      patches,
      newProducts,
      hiddenSkus: Array.from(hiddenSkus),
      mentionedSkus: Array.from(mentionedSkus),
      source: "sheet",
    });
  } catch (error) {
    console.error("No se pudo sincronizar la hoja de precios de VANTRO:", error);
    return emptyResponse("error");
  }
}
