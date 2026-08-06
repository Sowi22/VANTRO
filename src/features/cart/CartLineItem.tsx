"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useCartStore } from "@/store/cart.store";
import type { CartItem } from "@/types/cart.types";

export function CartLineItem({ item }: { item: CartItem }) {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex items-center gap-3 border-b border-white/[0.06] py-3 last:border-none">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-xs text-muted">
        {item.name.slice(0, 2).toUpperCase()}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <span className="text-sm font-semibold text-white">{item.name}</span>
        <span className="text-xs text-muted">{item.presentationLabel}</span>
        <span className="text-sm font-semibold text-white">
          {item.unitPrice != null
            ? formatCurrency(item.unitPrice * item.quantity)
            : "Consultar disponibilidad"}
        </span>
      </div>

      <div className="flex items-center gap-1 rounded-full bg-white/5 px-1">
        <button
          type="button"
          aria-label="Disminuir cantidad"
          onClick={() => setQuantity(item.sku, item.presentationLabel, item.quantity - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/10 active:scale-95"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-5 text-center text-sm font-semibold text-white">{item.quantity}</span>
        <button
          type="button"
          aria-label="Aumentar cantidad"
          onClick={() => setQuantity(item.sku, item.presentationLabel, item.quantity + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/10 active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <button
        type="button"
        aria-label="Eliminar producto"
        onClick={() => removeItem(item.sku, item.presentationLabel)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-danger/15 hover:text-danger"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
