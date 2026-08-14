import { formatCurrency } from "@/lib/currency";
import { brand } from "@/config/brand";
import type { CartItem } from "@/types/cart.types";
import type { BusinessSegment } from "@/types/product.types";

const businessLabels: Record<BusinessSegment, string> = {
  "comida-rapida": "Comida rápida",
  restaurante: "Restaurante",
  asadero: "Asadero",
  hogar: "Hogar",
  fitness: "Fitness",
};

export interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
  paymentMethod: string;
}

/**
 * Construye el mensaje de WhatsApp con el formato oficial definido en
 * PRD §10.7 / §11.3 y CMS Cap. 5. El cliente nunca escribe manualmente
 * su pedido: todo se genera dinámicamente.
 *
 * Formato: Cliente → Productos (cantidad, precio individual, subtotal) →
 * Subtotal/Total → Observaciones.
 */
export function buildOrderMessage(
  items: CartItem[],
  businessType: BusinessSegment | null,
  observations: string,
  customer?: OrderCustomer,
): string {
  const lines: string[] = ["Hola VANTRO 👋", "", "Quiero realizar el siguiente pedido."];

  const customerName = customer?.name.trim();
  const customerPhone = customer?.phone.trim();
  const customerAddress = customer?.address.trim();
  const paymentMethod = customer?.paymentMethod.trim();
  if (customerName || customerPhone || customerAddress || paymentMethod) {
    lines.push("", "Cliente:");
    if (customerName) lines.push(customerName);
    if (customerPhone) lines.push(customerPhone);
    if (customerAddress) lines.push(`Dirección: ${customerAddress}`);
    if (paymentMethod) lines.push(`Método de pago: ${paymentMethod}`);
  }

  if (businessType) {
    lines.push("", "Tipo de negocio:", businessLabels[businessType]);
  }

  lines.push("", "──────────────────", "", "Productos:", "");
  for (const item of items) {
    lines.push(`• ${item.name} (${item.presentationLabel})`);
    lines.push(`  Cantidad: ${item.quantity}`);
    if (item.unitPrice != null) {
      lines.push(`  Precio unidad: ${formatCurrency(item.unitPrice)}`);
      lines.push(`  Subtotal: ${formatCurrency(item.unitPrice * item.quantity)}`);
    } else {
      lines.push("  Precio: Consultar disponibilidad");
    }
    lines.push("");
  }

  lines.push("──────────────────");

  const pricedItems = items.filter((i) => i.unitPrice != null);
  const pendingCount = items.length - pricedItems.length;
  const total = pricedItems.reduce((sum, i) => sum + (i.unitPrice as number) * i.quantity, 0);

  if (pricedItems.length > 0) {
    const label = pendingCount > 0 ? "Subtotal (precios confirmados)" : "Total";
    lines.push("", `${label}: ${formatCurrency(total)}`);
  }
  if (pendingCount > 0) {
    lines.push(
      `${pendingCount === 1 ? "Hay 1 producto" : `Hay ${pendingCount} productos`} pendiente${pendingCount === 1 ? "" : "s"} de confirmar precio.`,
    );
  }

  if (observations.trim()) {
    lines.push("", "Observaciones:", observations.trim());
  }

  lines.push("", "Muchas gracias.");

  return lines.join("\n");
}

export function buildWhatsappUrl(message: string, phone: string = brand.whatsappNumber): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
