"use client";

import { Button } from "@/components/ui/Button";
import { brand } from "@/config/brand";

export function CtaFinal() {
  const message = encodeURIComponent(
    "Hola VANTRO 👋\nEstoy interesado en conocer sus productos. ¿Podrían ayudarme?",
  );

  // Solo desde tableta: en el celular ya está la barra de "Mi pedido".
  return (
    <section className="hidden bg-wine py-14 sm:block">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 text-center sm:px-6">
        <h2 className="font-display text-3xl font-bold text-ivory sm:text-4xl">
          ¿Listo para realizar tu pedido?
        </h2>
        <p className="text-ivory/80">
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
