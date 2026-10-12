"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CategoryNavProps {
  sections: { id: string; label: string }[];
}

/**
 * Barra de categorías fija bajo el encabezado: un toque lleva a la sección
 * y la categoría visible se resalta sola mientras se hace scroll.
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
      { rootMargin: "-130px 0px -60% 0px" },
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
        className="no-scrollbar mx-auto flex h-14 max-w-7xl items-center gap-2 overflow-x-auto px-4 sm:px-6"
      >
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            data-chip={section.id}
            className={cn(
              "flex h-10 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition active:scale-95",
              active === section.id
                ? "bg-primary text-ivory"
                : "border border-charcoal/15 bg-surface text-foreground hover:border-gold",
            )}
          >
            {section.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
