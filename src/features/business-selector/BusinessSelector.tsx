"use client";

import { Search } from "lucide-react";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { businessTypes } from "@/data/businesses";
import { useUIStore } from "@/store/ui.store";
import { BusinessCard } from "./BusinessCard";

export function BusinessSelector() {
  const activeFilter = useUIStore((s) => s.activeFilter);
  const setBusinessFilter = useUIStore((s) => s.setBusinessFilter);

  const goToCatalog = () =>
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionTitle title="¿Qué necesitas hoy?" align="center" className="mb-8" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {businessTypes.map((business) => (
          <BusinessCard
            key={business.id}
            business={business}
            active={activeFilter.type === "business" && activeFilter.value === business.id}
            onSelect={() => {
              setBusinessFilter(business.id);
              goToCatalog();
            }}
          />
        ))}

        <button
          type="button"
          onClick={() =>
            document.querySelector<HTMLButtonElement>('[aria-label="Buscar producto"]')?.click()
          }
          className="flex min-h-[150px] flex-col items-center justify-center gap-3 rounded-[20px] border border-white/[0.06] bg-surface p-4 text-center text-white transition hover:border-white/20 active:scale-[0.98]"
        >
          <Search className="h-7 w-7" strokeWidth={1.5} />
          <span className="text-sm font-semibold leading-tight">Buscar producto</span>
        </button>
      </div>
    </section>
  );
}
