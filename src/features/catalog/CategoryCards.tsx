"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";
import { imgurVariant } from "@/lib/image";
import type { ProteinCategory } from "@/types/product.types";
import type { CatalogSection } from "./categories";

/**
 * Tarjetas de categoría (Res, Pollo, Cerdo, Vísceras…) siempre visibles
 * debajo del inicio: un toque lleva a la sección de esa categoría.
 */
export function CategoryCards({ sections }: { sections: CatalogSection[] }) {
  const categories = sections.filter((s) => s.id.startsWith("cat-"));

  return (
    <section aria-label="Categorías" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {categories.map((section, index) => {
          const photo = section.products.find((p) => p.image)?.image;
          const count = section.products.length;
          return (
            <motion.a
              key={section.id}
              href={`#${section.id}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group flex flex-col overflow-hidden rounded-[20px] border border-charcoal/10 bg-surface transition hover:border-gold active:scale-[0.98] sm:flex-row sm:items-center sm:gap-4 sm:p-3"
            >
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgurVariant(photo, "m")}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/10] w-full object-cover sm:h-20 sm:w-24 sm:shrink-0 sm:rounded-[16px]"
                />
              ) : (
                <MediaPlaceholder
                  category={section.id.replace("cat-", "") as ProteinCategory}
                  label=""
                  className="aspect-[16/10] w-full rounded-none sm:h-20 sm:w-24 sm:shrink-0 sm:rounded-[16px]"
                />
              )}
              <div className="flex flex-1 items-center justify-between gap-2 p-3 sm:p-0">
                <div className="flex flex-col">
                  <span className="text-base font-bold uppercase text-primary sm:text-lg">
                    {section.label}
                  </span>
                  <span className="text-xs text-muted">
                    {count === 0 ? "Próximamente" : `${count} ${count === 1 ? "producto" : "productos"}`}
                  </span>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-wine transition group-hover:translate-x-1" />
              </div>
            </motion.a>
          );
        })}
      </div>
    </section>
  );
}
