import { NextResponse } from "next/server";
import { parseCsv } from "@/lib/csv";
import { slugify } from "@/lib/slug";
import { products as baseProducts } from "@/data/products";
import type {
  AvailabilityOverrideMap,
  BusinessSegment,
  PresentationUnit,
  PriceOverrideMap,
  Product,
  ProductPatchMap,
  ProteinCategory,
} from "@/types/product.types";

/**
 * Sincroniza precios, disponibilidad, fotos y productos nuevos desde una
 * hoja de Google Sheets publicada como CSV (Archivo → Compartir → Publicar
 * en la Web → CSV, o compartida como "cualquiera con el enlace" + URL
 * `/export?format=csv`).
 *
 * Columnas:
 * - sku, cantidad, precio, precio_anterior, disponible → como antes.
 * - imagen (opcional): URL de la foto (imgur, Google Drive, etc). Aplica a
 *   productos existentes y nuevos.
 * - categoria, negocios, tipo_venta (opcionales): solo se usan cuando el
 *   `sku` de la fila NO existe en `data/products.ts` — en ese caso, la fila
 *   define un producto completamente nuevo.
 *
 * Si `VANTRO_PRICES_SHEET_CSV_URL` no está configurada, o la hoja no
 * responde, devolvemos todo vacío — el catálogo sigue funcionando con los
 * datos de `src/data/products.ts` exactamente como hoy.
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

/** `undefined` = la celda está vacía o no reconocida: no forzamos ningún cambio. */
function parseAvailability(raw: string | undefined): boolean | undefined {
  if (!raw) return undefined;
  const normalized = raw.trim().toLowerCase();
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

interface SheetRow {
  name?: string;
  label: string;
  price?: number;
  compareAtPrice?: number;
  available?: boolean;
  image?: string;
  category?: ProteinCategory;
  segments?: BusinessSegment[];
  unit?: PresentationUnit;
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

  const presentations = rows
    .filter((r) => r.label)
    .map((r) => ({
      label: r.label,
      weightGrams: parseWeightGrams(r.label),
      price: r.price ?? null,
      compareAtPrice: r.compareAtPrice,
    }));

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
    const overrides: PriceOverrideMap = {};
    const availability: AvailabilityOverrideMap = {};
    const patches: ProductPatchMap = {};
    const newProductRows = new Map<string, SheetRow[]>();

    for (const row of rows.slice(1)) {
      const sku = row[skuIdx]?.trim();
      const label = row[labelIdx]?.trim();
      if (!sku) continue;

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

      if (!knownSkus.has(sku)) {
        // SKU que no existe en el código: se acumula para construir un producto nuevo.
        const list = newProductRows.get(sku) ?? [];
        list.push(sheetRow);
        newProductRows.set(sku, list);
        continue;
      }

      // SKU conocido: precio/disponibilidad/imagen se aplican como parche sobre el producto existente.
      if (label && sheetRow.price !== undefined) {
        overrides[`${sku}__${label}`] = { price: sheetRow.price, compareAtPrice: sheetRow.compareAtPrice };
      }
      if (sheetRow.available === false) {
        availability[sku] = false;
      } else if (sheetRow.available === true && availability[sku] !== false) {
        availability[sku] = true;
      }
      if (sheetRow.image) {
        patches[sku] = { ...patches[sku], image: sheetRow.image };
      }
    }

    const newProducts: Product[] = Array.from(newProductRows.entries()).map(([sku, sheetRows]) =>
      buildNewProduct(sku, sheetRows),
    );

    return NextResponse.json({ overrides, availability, patches, newProducts, source: "sheet" });
  } catch (error) {
    console.error("No se pudo sincronizar la hoja de precios de VANTRO:", error);
    return emptyResponse("error");
  }
}
