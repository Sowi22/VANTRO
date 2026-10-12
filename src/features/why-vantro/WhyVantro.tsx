"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Clock, HeartHandshake, PackageCheck, ShieldCheck } from "lucide-react";

const statement =
  "Más que vender proteínas, queremos ser el proveedor en el que puedas confiar todos los días.";

const pillars = [
  {
    icon: ShieldCheck,
    title: "La calidad no puede depender del día.",
    description: "Seleccionamos cuidadosamente cada corte para mantener un estándar constante.",
  },
  {
    icon: PackageCheck,
    title: "Preparado como para nuestra propia cocina.",
    description:
      "Todos los productos son porcionados y empacados al vacío bajo procesos organizados.",
  },
  {
    icon: Clock,
    title: "Tu cocina tiene horarios. Nosotros también.",
    description: "Preparamos cada pedido con organización para cumplir los tiempos acordados.",
  },
  {
    icon: HeartHandshake,
    title: "Nunca serás un número más.",
    description: "Cada cliente recibe acompañamiento antes, durante y después de su compra.",
  },
];

export function WhyVantro() {
  const ref = useRef<HTMLDivElement>(null);
  // La frase queda fija en pantalla y cada palabra se ilumina a medida que
  // se hace scroll (patrón "text reveal" de Apple / 21st.dev).
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.6"] });
  const words = statement.split(" ");

  return (
    <section className="bg-bordo">
      <div ref={ref} className="relative h-[170vh]">
        <div className="sticky top-[120px] mx-auto flex min-h-[60vh] max-w-5xl flex-col justify-center gap-6 px-4 sm:px-6">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            ¿Por qué VANTRO?
          </span>
          <p className="font-display text-[2rem] font-bold leading-[1.15] sm:text-5xl lg:text-6xl">
            {words.map((word, index) => (
              <Word
                key={index}
                progress={scrollYProgress}
                range={[index / words.length, (index + 1) / words.length]}
              >
                {word}
              </Word>
            ))}
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 pb-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {pillars.map((pillar, index) => (
          <motion.div
            key={pillar.title}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-3 rounded-[20px] border border-gold/20 bg-wine/40 p-5"
          >
            <pillar.icon className="h-7 w-7 text-gold" strokeWidth={1.5} />
            <h3 className="text-base font-semibold text-ivory">{pillar.title}</h3>
            <p className="text-sm text-ivory/70">{pillar.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.25em] inline-block text-ivory">
      {children}
    </motion.span>
  );
}
