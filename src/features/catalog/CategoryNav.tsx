"use client";

import { useEffect, useRef, useState } from "react";
import { Beef, Bone, Drumstick, Ham, Package, Tag, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  ofertas: Tag,
  "cat-res": Beef,
  "cat-pollo": Drumstick,
  "cat-cerdo": Ham,
  "cat-visceras": Bone,
};

interface CategoryNavProps {
  sections: { id: string; label: string }[];
}

/**
 * Barra de categorías fija bajo el encabezado: un toque lleva a la sección
 * y la categoría visible se resalta sola mientras se hace scroll. En el
 * celular los botones son grandes (con ícono) y ocupan todo el ancho, y la
 * barra conserva ese tamaño mientras queda fija.
 */
export function CategoryNav({ sections }: CategoryNavProps) {
  const [active, setActive] = useState(sections[0]?.id);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      // Franja horizontal justo debajo de las barras fijas.
      { rootMargin: "-150px 0px -60% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  // Mantiene visible la píldora activa dentro de la barra. Se desplaza solo
  // la barra (no scrollIntoView, que también movería la página y cortaría
  // el scroll suave hacia la sección elegida).
  useEffect(() => {
    const track = trackRef.current;
    const chip = track?.querySelector<HTMLElement>(`[data-chip="${active}"]`);
    if (!track || !chip) return;
    track.scrollTo({
      left: chip.offsetLeft - track.clientWidth / 2 + chip.clientWidth / 2,
      behavior: "smooth",
    });
  }, [active]);

  return (
    <nav
      aria-label="Categorías del catálogo"
      className="sticky top-16 z-30 border-b border-charcoal/10 bg-background/90 backdrop-blur-md sm:top-[76px]"
    >
      <div
        ref={trackRef}
        className="no-scrollbar mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-3 py-2.5 sm:h-14 sm:px-6 sm:py-0"
      >
        {sections.map((section) => {
          const Icon = icons[section.id] ?? Package;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              data-chip={section.id}
              className={cn(
                "flex h-[60px] min-w-[76px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-sm font-semibold transition active:scale-95",
                "sm:h-10 sm:min-w-0 sm:flex-none sm:flex-row sm:rounded-full sm:px-4",
                active === section.id
                  ? "bg-primary text-ivory"
                  : "border border-charcoal/15 bg-surface text-foreground hover:border-gold",
              )}
            >
              <Icon className="h-5 w-5 sm:hidden" strokeWidth={1.75} />
              {section.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
