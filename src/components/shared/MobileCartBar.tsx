"use client";

import { AnimatePresence, motion } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useCartStore } from "@/store/cart.store";
import { useUIStore } from "@/store/ui.store";

export function MobileCartBar() {
  const totalItems = useCartStore((s) => s.totalItems());
  const totalEstimated = useCartStore((s) => s.totalEstimated());
  const hasAllPrices = useCartStore((s) => s.items.every((i) => i.unitPrice != null));
  const openCart = useUIStore((s) => s.openCart);
  const isCartOpen = useUIStore((s) => s.isCartOpen);

  return (
    <AnimatePresence>
      {totalItems > 0 && !isCartOpen ? (
        <motion.button
          type="button"
          onClick={openCart}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-between rounded-[18px] bg-primary px-5 py-4 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:hidden"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ShoppingBag className="h-4 w-4" />
            {totalItems} {totalItems === 1 ? "producto" : "productos"}
          </span>
          <span className="text-sm font-bold">
            {hasAllPrices ? formatCurrency(totalEstimated) : "Ver pedido"}
          </span>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
