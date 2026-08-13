"use client";

import { AnimatePresence, motion } from "motion/react";
import { useFlyToCartStore } from "@/store/fly-to-cart.store";

/**
 * Capa invisible montada una sola vez en el layout: dibuja el puntito que
 * "vuela" desde el botón "Agregar" que se tocó hasta el ícono del carrito,
 * para que la persona vea claramente que su producto se sumó al pedido.
 */
export function FlyToCartLayer() {
  const items = useFlyToCartStore((s) => s.items);
  const remove = useFlyToCartStore((s) => s.remove);

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]" aria-hidden="true">
      <AnimatePresence>
        {items.map((item) => {
          // El tamaño del punto es 16px (h-4 w-4): se resta la mitad para
          // que el CENTRO del punto (no su esquina) quede sobre from/to.
          // No se puede combinar con una clase Tailwind de translate para
          // centrar, porque Framer Motion ya controla `transform` vía x/y.
          const HALF = 8;
          return (
            <motion.span
              key={item.id}
              initial={{ x: item.from.x - HALF, y: item.from.y - HALF, scale: 1, opacity: 1 }}
              animate={{ x: item.to.x - HALF, y: item.to.y - HALF, scale: 0.2, opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.3, 0.8, 0.3, 1] }}
              onAnimationComplete={() => remove(item.id)}
              className="fixed left-0 top-0 h-4 w-4 rounded-full bg-primary shadow-[0_0_14px_rgba(217,4,41,0.85)]"
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
