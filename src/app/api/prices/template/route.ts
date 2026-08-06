import { NextResponse } from "next/server";
import { products } from "@/data/products";

/**
 * Genera un CSV de arranque con sku, nombre, cantidad (presentación), precio
 * actual y disponibilidad actual de cada producto — listo para importar en
 * Google Sheets (Archivo → Importar → Reemplazar hoja de cálculo) y seguir
 * editando desde ahí.
 *
 * Columnas:
 * - sku: clave técnica, no la edites ni la borres.
 * - producto: solo de referencia, para saber qué producto es cada fila.
 * - cantidad: la presentación (500 g, 1 kg, Unidad, etc.).
 * - precio: edítalo para cambiar el precio de esa cantidad.
 * - disponible: "Si" o "No". Si pones "No" en cualquier fila de un
 *   producto, ese producto se muestra como "Agotado" en toda la página.
 *
 * Uso: con "npm run dev" corriendo, abrir
 * http://localhost:3000/api/prices/template
 */

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET() {
  const header = ["sku", "producto", "cantidad", "precio", "disponible"];
  const rows = [header];

  for (const product of products) {
    const disponible = product.status === "agotado" ? "No" : "Si";
    for (const presentation of product.presentations) {
      rows.push([
        product.sku,
        product.name,
        presentation.label,
        presentation.price != null ? String(presentation.price) : "",
        disponible,
      ]);
    }
  }

  const csv = rows.map((row) => row.map((cell) => csvEscape(cell)).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="vantro-precios-plantilla.csv"',
    },
  });
}
