"use client";

import { motion } from "motion/react";
import Image from "next/image";
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
    <section id="inicio" className="relative overflow-hidden border-b-2 border-gold/40 bg-bordo pb-14 pt-10 sm:pt-14">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6"
        >
          <h1 className="text-4xl font-bold leading-[1.1] text-ivory sm:text-5xl">
            Proteína premium para{" "}
            <span className="text-gold">negocios que exigen lo mejor.</span>
          </h1>

          <p className="max-w-xl text-base text-ivory/80 sm:text-lg">
            Seleccionamos, porcionamos y empacamos al vacío carnes, pollo y cerdo para
            restaurantes, comidas rápidas y hogares que buscan calidad constante, higiene y
            entregas confiables.
          </p>

          <ul className="flex flex-col gap-2 text-sm text-ivory/80 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/15 text-gold">
                  ✓
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button variant="light" onClick={scrollToCatalog} className="w-full sm:w-auto">
              Ver catálogo completo
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center"
        >
          <Image
            src="/brand/logo-full.png"
            alt="VANTRO Carnes · Est. 2025"
            width={1200}
            height={860}
            className="h-auto w-full max-w-[520px]"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}
