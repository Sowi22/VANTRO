"use client";

import { Button } from "@/components/ui/Button";
import { brand } from "@/config/brand";

export function CtaFinal() {
  const message = encodeURIComponent(
    "Hola VANTRO 👋\nEstoy interesado en conocer sus productos. ¿Podrían ayudarme?",
  );

  return (
    <section className="border-t border-white/[0.06] bg-surface py-14">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 text-center sm:px-6">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          ¿Listo para realizar tu pedido?
        </h2>
        <p className="text-muted">
          Estamos preparados para ayudarte a abastecer tu negocio con productos de calidad,
          atención personalizada y entregas organizadas.
        </p>
        <Button variant="success" asChild>
          <a href={`https://wa.me/${brand.whatsappNumber}?text=${message}`} target="_blank" rel="noreferrer">
            Hablar por WhatsApp
          </a>
        </Button>
      </div>
    </section>
  );
}
