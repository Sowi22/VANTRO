import { coverageCities } from "@/config/brand";

const items = [
  "Empacado al vacío",
  "Calidad constante",
  "Porcionado a tu medida",
  `Entregas en ${coverageCities.join(", ")}`,
  "Pedido fácil por WhatsApp",
];

/**
 * Cinta animada solo con CSS (se duplica el contenido para que el ciclo no
 * se note). Solo desde tableta: en el celular se pasa directo al catálogo.
 */
export function TrustMarquee() {
  return (
    <div
      className="hidden overflow-hidden border-y border-gold/20 bg-wine py-3 sm:block"
      aria-label="Por qué VANTRO"
    >
      <div className="animate-marquee flex w-max gap-8 whitespace-nowrap">
        {[...items, ...items].map((item, index) => (
          <span
            key={index}
            aria-hidden={index >= items.length}
            className="flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.2em] text-ivory/85"
          >
            {item}
            <span className="text-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
