"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Search, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import { useUIStore } from "@/store/ui.store";
import { SearchBar } from "@/features/search/SearchBar";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useUIStore((s) => s.openCart);
  const searchOpen = useUIStore((s) => s.isSearchOpen);
  const toggleSearch = useUIStore((s) => s.toggleSearch);
  const closeSearch = useUIStore((s) => s.closeSearch);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-16 w-full sm:h-[76px] backdrop-blur-md transition-colors duration-200",
        scrolled ? "bg-bordo/95 border-b border-gold/20" : "bg-bordo",
      )}
    >
      <div className="relative mx-auto flex h-full max-w-7xl items-center justify-end gap-4 px-4 sm:px-6">
        <a
          href="#inicio"
          className="absolute left-1/2 top-1/2 flex shrink-0 -translate-x-1/2 -translate-y-1/2 items-center"
        >
          <Image
            src="/brand/logo-emblem.png"
            alt="VANTRO Carnes"
            width={800}
            height={543}
            className="h-12 w-auto sm:h-14"
            priority
          />
        </a>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={toggleSearch}
            aria-label="Buscar producto"
            className="flex h-11 items-center gap-2 rounded-full px-3 text-ivory transition hover:bg-ivory/10 hover:text-gold active:scale-95"
          >
            <Search className="h-5 w-5" />
            <span className="hidden text-sm sm:inline">Buscar producto</span>
          </button>

          <button
            type="button"
            id="cart-icon-target"
            onClick={openCart}
            aria-label="Ver mi pedido"
            className="relative flex h-11 items-center gap-2 rounded-full px-3 text-ivory transition hover:bg-ivory/10 hover:text-gold active:scale-95"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="hidden text-sm sm:inline">Mi pedido</span>
            {totalItems > 0 ? (
              <motion.span
                key={totalItems}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold text-bordo"
              >
                {totalItems}
              </motion.span>
            ) : null}
          </button>
        </div>
      </div>

      {searchOpen ? (
        <div className="border-t border-gold/20 bg-background px-4 py-3 sm:px-6">
          <SearchBar autoFocus onResultSelected={closeSearch} />
        </div>
      ) : null}
    </header>
  );
}
