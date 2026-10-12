"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { MessageCircle } from "lucide-react";
import { brand } from "@/config/brand";
import { PromoCarousel } from "./PromoCarousel";

const benefits = ["Empacado al vacío", "Calidad constante", "Entrega rápida en Barranquilla"];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  // Efecto tipo Apple: al bajar, el hero se aleja suavemente (escala y
  // opacidad ligadas al scroll). Solo transform/opacity: no causa reflow.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.2]);

  const whatsappMessage = encodeURIComponent(
    "Hola VANTRO 👋\nQuiero hacer un pedido. ¿Me ayudan?",
  );

  return (
    <section ref={ref} id="inicio" className="relative overflow-hidden bg-bordo">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(111,29,36,0.9),transparent_60%)]" />
      <motion.div
        style={{ scale, opacity }}
        className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-7 px-4 pb-10 pt-6 sm:px-6 sm:pt-12 lg:grid-cols-2 lg:gap-14 lg:pb-16"
      >
        <div className="animate-fade-up flex flex-col gap-4 sm:gap-6">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Carnes premium · Barranquilla
          </span>
          <h1 className="font-display text-[2.1rem] font-bold leading-[1.08] text-ivory sm:text-5xl lg:text-6xl">
            Proteína premium para{" "}
            <span className="text-gold">negocios que exigen lo mejor.</span>
          </h1>

          <p className="hidden max-w-xl text-base text-ivory/80 sm:block sm:text-lg">
            Seleccionamos, porcionamos y empacamos al vacío carnes, pollo y cerdo para
            restaurantes, comidas rápidas y hogares que buscan calidad constante, higiene y
            entregas confiables.
          </p>

          <ul className="flex flex-wrap gap-2">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="rounded-full border border-gold/30 px-3 py-1 text-xs font-medium text-ivory/90"
              >
                ✓ {benefit}
              </li>
            ))}
          </ul>

          <div className="hidden gap-3 pt-2 lg:flex">
            <a
              href="#catalogo"
              className="flex h-14 items-center rounded-full bg-ivory px-7 text-sm font-bold text-bordo transition hover:bg-white active:scale-[0.98]"
            >
              Ver catálogo completo
            </a>
            <a
              href={`https://wa.me/${brand.whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-14 items-center gap-2 rounded-full border border-ivory/25 px-7 text-sm font-semibold text-ivory transition hover:border-gold hover:text-gold"
            >
              <MessageCircle className="h-4 w-4" />
              Pedir por WhatsApp
            </a>
          </div>
        </div>

        <div className="animate-fade-up [animation-delay:120ms]">
          <PromoCarousel />
        </div>
      </motion.div>
    </section>
  );
}
