import { NextResponse } from "next/server";
import { getPriceSheetData } from "@/lib/price-sheet";

/** Documentación de columnas y reglas: ver `src/lib/price-sheet.ts`. */
export const revalidate = 60;

export async function GET() {
  return NextResponse.json(await getPriceSheetData());
}
