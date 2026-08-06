"use client";

import { motion } from "motion/react";
import { Beef } from "lucide-react";
import { Button } from "@/components/ui/Button";

const benefits = [
  "Empacado al vacío",
  "Calidad constante",
  "Entrega rápida en Barranquilla",
];

export function Hero() {
  const scrollToCatalog = () => {
    document.getElementById("categorias-proteina")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="inicio" className="relative overflow-hidden bg-background pb-14 pt-10 sm:pt-14">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6"
        >
          <h1 className="text-4xl font-bold leading-[1.1] text-white sm:text-5xl">
            Proteína premium para{" "}
            <span className="text-primary">negocios que exigen lo mejor.</span>
          </h1>

          <p className="max-w-xl text-base text-muted sm:text-lg">
            Seleccionamos, porcionamos y empacamos al vacío carnes, pollo y cerdo para
            restaurantes, comidas rápidas y hogares que buscan calidad constante, higiene y
            entregas confiables.
          </p>

          <ul className="flex flex-col gap-2 text-sm text-muted sm:flex-row sm:flex-wrap sm:gap-x-6">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                  ✓
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button onClick={scrollToCatalog} className="w-full sm:w-auto">
              Ver catálogo completo
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-gradient-to-br from-surface via-surface to-black"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(217,4,41,0.25),transparent_60%)]" />
          <div className="flex h-full w-full flex-col items-center justify-center gap-3">
            <Beef className="h-16 w-16 text-white/20" strokeWidth={1.2} />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/25">
              Fotografía de campaña próximamente
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
