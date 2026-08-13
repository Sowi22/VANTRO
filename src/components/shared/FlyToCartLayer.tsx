"use client";

import { AnimatePresence, motion } from "motion/react";
import { useFlyToCartStore } from "@/store/fly-to-cart.store";

const EMOJI_SIZE = 28;
const HALF = EMOJI_SIZE / 2;

/**
 * Capa invisible montada una sola vez en el layout: dibuja el emoji de
 * carne que "vuela" desde el botón (Agregar, o + al aumentar cantidad) que
 * se tocó hasta el ícono del carrito, para que la persona vea claramente
 * que su producto se sumó al pedido.
 */
export function FlyToCartLayer() {
  const items = useFlyToCartStore((s) => s.items);
  const remove = useFlyToCartStore((s) => s.remove);

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]" aria-hidden="true">
      <AnimatePresence>
        {items.map((item) => (
          // Se resta la mitad del tamaño del emoji para que su CENTRO (no
          // su esquina) quede sobre from/to. No se puede centrar con una
          // clase Tailwind de translate porque Framer Motion ya controla
          // `transform` vía x/y.
          <motion.span
            key={item.id}
            initial={{ x: item.from.x - HALF, y: item.from.y - HALF, scale: 1, opacity: 1, rotate: 0 }}
            animate={{ x: item.to.x - HALF, y: item.to.y - HALF, scale: 0.3, opacity: 0.7, rotate: 18 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.3, 0.8, 0.3, 1] }}
            onAnimationComplete={() => remove(item.id)}
            style={{ fontSize: EMOJI_SIZE, lineHeight: 1 }}
            className="fixed left-0 top-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
          >
            🥩
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
