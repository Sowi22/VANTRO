"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { TrustMarquee } from "@/components/shared/TrustMarquee";
import { getBestOffer, useCatalog } from "@/hooks/useCatalog";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
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
      <CategoryNav sections={sections} />
      <TrustMarquee />

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
              {section.products.length} {section.products.length === 1 ? "producto" : "productos"}
            </span>
            {Number.isFinite(minPrice) ? (
              <span className="text-sm font-semibold text-wine">desde {formatCurrency(minPrice)}</span>
            ) : null}
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {section.products.map((product, index) => (
            <ProductCard key={product.sku} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
