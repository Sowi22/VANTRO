"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { faqItems } from "@/data/faq";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Solo desde tableta: en el celular la página termina en el catálogo.
  return (
    <section className="hidden bg-cloud py-14 sm:block">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionTitle title="Preguntas frecuentes" align="center" className="mb-8" />

        <div className="flex flex-col gap-2">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-2xl border border-charcoal/10 bg-surface"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-foreground">{item.question}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                {isOpen ? (
                  <p className="px-5 pb-4 text-sm text-muted">{item.answer}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
