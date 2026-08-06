"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";
import { proteinCategories } from "@/data/businesses";
import { useUIStore } from "@/store/ui.store";

export function ProteinCategories() {
  const setProteinFilter = useUIStore((s) => s.setProteinFilter);

  const handleSelect = (id: (typeof proteinCategories)[number]["id"]) => {
    setProteinFilter(id);
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="categorias-proteina" className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {proteinCategories.map((category, index) => (
          <motion.button
            key={category.id}
            type="button"
            onClick={() => handleSelect(category.id)}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group flex items-center gap-4 overflow-hidden rounded-[20px] border border-white/[0.06] bg-surface p-4 text-left transition hover:border-primary/40"
          >
            <MediaPlaceholder category={category.id} className="h-20 w-24 shrink-0" label="" />
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-lg font-bold uppercase text-white">{category.label}</span>
              <span className="text-sm text-muted">{category.description}</span>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-primary transition group-hover:translate-x-1" />
          </motion.button>
        ))}
      </div>
    </section>
  );
}
