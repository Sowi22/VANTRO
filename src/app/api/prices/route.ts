import { NextResponse } from "next/server";
import { parseCsv } from "@/lib/csv";
import type { AvailabilityOverrideMap, PriceOverrideMap } from "@/types/product.types";

/**
 * Sincroniza precios y disponibilidad desde una hoja de Google Sheets
 * publicada como CSV (Archivo → Compartir → Publicar en la Web → CSV).
 * Columnas esperadas: `sku`, `producto` (solo referencia), `cantidad`,
 * `precio`, `disponible` (Sí/No, opcional).
 *
 * Si `VANTRO_PRICES_SHEET_CSV_URL` no está configurada, o la hoja no
 * responde, devolvemos todo vacío — el catálogo sigue funcionando con los
 * datos de `src/data/products.ts` exactamente como hoy. Nunca se rompe el
 * sitio por un problema con la hoja de cálculo.
 */

function parsePrice(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/[^\d.-]/g, "");
  if (!cleaned) return undefined;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : undefined;
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

export const revalidate = 60;

function emptyResponse(source: string) {
  return NextResponse.json({
    overrides: {} as PriceOverrideMap,
    availability: {} as AvailabilityOverrideMap,
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
    // Aceptamos "cantidad" (nombre actual) y "presentacion" (nombre anterior).
    const labelIdx = header.indexOf("cantidad") !== -1 ? header.indexOf("cantidad") : header.indexOf("presentacion");
    const priceIdx = header.indexOf("precio");
    const compareIdx = header.indexOf("precio_anterior");
    const availableIdx = header.indexOf("disponible");

    if (skuIdx === -1 || labelIdx === -1 || priceIdx === -1) {
      console.warn(
        "VANTRO_PRICES_SHEET_CSV_URL: la hoja no tiene las columnas esperadas (sku, cantidad, precio).",
      );
      return emptyResponse("sheet-bad-header");
    }

    const overrides: PriceOverrideMap = {};
    const availability: AvailabilityOverrideMap = {};

    for (const row of rows.slice(1)) {
      const sku = row[skuIdx]?.trim();
      const label = row[labelIdx]?.trim();
      if (!sku || !label) continue;

      // Celda de precio vacía o inválida: no sobrescribimos el precio de esa fila.
      const price = parsePrice(row[priceIdx]);
      if (price !== undefined) {
        const compareAtPrice = parsePrice(row[compareIdx]);
        overrides[`${sku}__${label}`] = { price, compareAtPrice };
      }

      // "No" en cualquier fila del sku marca todo el producto como agotado.
      // "Sí" explícito lo reactiva, incluso si en el código está agotado.
      const available = parseAvailability(row[availableIdx]);
      if (available === false) {
        availability[sku] = false;
      } else if (available === true && availability[sku] !== false) {
        availability[sku] = true;
      }
    }

    return NextResponse.json({ overrides, availability, source: "sheet" });
  } catch (error) {
    console.error("No se pudo sincronizar la hoja de precios de VANTRO:", error);
    return emptyResponse("error");
  }
}
