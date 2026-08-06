import { NextResponse } from "next/server";
import { products } from "@/data/products";

/**
 * Genera un CSV de arranque con todos los productos actuales — listo para
 * importar en Google Sheets (Archivo → Importar → Reemplazar hoja de
 * cálculo) y seguir editando desde ahí. Incluye una fila de ejemplo al
 * final mostrando cómo se agrega un producto totalmente nuevo.
 *
 * Columnas:
 * - sku: clave técnica. Si coincide con un producto existente, edita ese
 *   producto. Si es un sku que no existe todavía, CREA un producto nuevo.
 * - producto: nombre visible.
 * - cantidad: la presentación (500 g, 1 kg, Unidad, etc.).
 * - precio: precio de esa cantidad.
 * - disponible: "Si" o "No". "No" en cualquier fila de un producto lo
 *   muestra como "Agotado" en toda la página.
 * - imagen: URL pública de la foto (ej. link de imgur.com). Funciona tanto
 *   para productos existentes como para productos nuevos.
 * - categoria: res / pollo / cerdo / complemento / mixto — solo se usa al
 *   crear un producto nuevo, se ignora en productos que ya existen.
 * - negocios: comida-rapida, restaurante, asadero, hogar, fitness (los que
 *   apliquen, separados por coma) — solo se usa al crear un producto nuevo.
 * - tipo_venta: peso / unidad / ambos — solo se usa al crear un producto nuevo.
 *
 * Uso: con "npm run dev" corriendo, abrir
 * http://localhost:3000/api/prices/template
 */

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET() {
  const header = [
    "sku",
    "producto",
    "cantidad",
    "precio",
    "disponible",
    "imagen",
    "categoria",
    "negocios",
    "tipo_venta",
  ];
  const rows = [header];

  for (const product of products) {
    const disponible = product.status === "agotado" ? "No" : "Si";
    const negocios = product.businessSegments.join(",");
    for (const presentation of product.presentations) {
      rows.push([
        product.sku,
        product.name,
        presentation.label,
        presentation.price != null ? String(presentation.price) : "",
        disponible,
        product.image ?? "",
        product.proteinCategory,
        negocios,
        product.unit,
      ]);
    }
  }

  // Ejemplo de producto nuevo: cambia NUEVO-001 por un sku propio y edita los
  // valores. Puedes borrar estas filas de ejemplo cuando ya no las necesites.
  rows.push([
    "NUEVO-001",
    "Nombre del producto nuevo",
    "500 g",
    "15000",
    "Si",
    "https://i.imgur.com/tu-imagen.jpg",
    "res",
    "restaurante,hogar",
    "peso",
  ]);
  rows.push(["NUEVO-001", "Nombre del producto nuevo", "1 kg", "28000", "Si", "", "", "", ""]);

  const csv = rows.map((row) => row.map((cell) => csvEscape(cell)).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="vantro-precios-plantilla.csv"',
    },
  });
}
