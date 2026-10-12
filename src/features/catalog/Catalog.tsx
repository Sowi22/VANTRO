"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { brand } from "@/config/brand";
import { getBestOffer, useCatalog } from "@/hooks/useCatalog";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { CategoryCards } from "./CategoryCards";
import { CategoryNav } from "./CategoryNav";
import { groupByCategory, type CatalogSection } from "./categories";
import { ProductCard } from "./ProductCard";

const OFFERS_SECTION_ID = "ofertas";

/**
 * Catálogo completo en una sola página, una sección por categoría: la
 * persona solo hace scroll y agrega, sin abrir filtros ni pantallas nuevas.
 */
export function Catalog() {
  const catalog = useCatalog();

  const sections = useMemo<CatalogSection[]>(() => {
    const offers = catalog.filter((p) => getBestOffer(p));
    const byCategory = groupByCategory(catalog);
    return offers.length > 0
      ? [{ id: OFFERS_SECTION_ID, label: "Ofertas", products: offers }, ...byCategory]
      : byCategory;
  }, [catalog]);

  return (
    <>
      <CategoryCards sections={sections} />
      <CategoryNav sections={sections} />

      <div id="catalogo">
        {sections.length === 0 ? (
          <p className="mx-auto max-w-7xl px-4 py-16 text-center text-muted sm:px-6">
            Nuestro equipo está actualizando el inventario. Si necesitas ayuda, escríbenos por
            WhatsApp.
          </p>
        ) : (
          sections.map((section, index) => (
            <CategorySection key={section.id} section={section} alt={index % 2 === 1} />
          ))
        )}
      </div>
    </>
  );
}

function CategorySection({ section, alt }: { section: CatalogSection; alt: boolean }) {
  const minPrice = Math.min(
    ...section.products.flatMap((p) => p.presentations.map((pr) => pr.price ?? Infinity)),
  );

  return (
    <section id={section.id} className={cn("py-10 sm:py-14", alt ? "bg-cloud" : "bg-background")}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 flex items-end justify-between gap-4"
        >
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">
              {section.label}
            </h2>
            {section.description ? (
              <p className="text-sm text-muted sm:text-base">{section.description}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col items-end text-right">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              {section.products.length === 0
                ? "Próximamente"
                : `${section.products.length} ${section.products.length === 1 ? "producto" : "productos"}`}
            </span>
            {section.products.length > 0 && Number.isFinite(minPrice) ? (
              <span className="text-sm font-semibold text-wine">desde {formatCurrency(minPrice)}</span>
            ) : null}
          </div>
        </motion.div>

        {section.products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-charcoal/20 bg-surface px-6 py-10 text-center">
            <p className="font-semibold text-foreground">
              Muy pronto tendremos {section.label.toLowerCase()} en el catálogo.
            </p>
            <p className="text-sm text-muted">
              ¿Lo necesitas ya? Escríbenos y te contamos qué hay disponible.
            </p>
            <a
              href={`https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(
                `Hola VANTRO 👋\nQuisiera saber qué tienen disponible en ${section.label}.`,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1 flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-ivory transition active:scale-95"
            >
              Preguntar por WhatsApp
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {section.products.map((product, index) => (
              <ProductCard key={product.sku} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
