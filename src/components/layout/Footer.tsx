import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { brand, coverageCities } from "@/config/brand";
import { formatPhone } from "@/lib/phone";

export function Footer() {
  return (
    <footer className="border-t border-gold/30 bg-bordo">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <Image
            src="/brand/logo-full.png"
            alt="VANTRO"
            width={1200}
            height={860}
            className="h-24 w-auto object-contain object-left"
          />
          <p className="text-sm text-ivory/75">
            Impulsamos restaurantes, negocios gastronómicos y hogares con proteínas
            seleccionadas, procesos organizados y entregas confiables.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gold">Atención</h3>
          <span className="text-sm text-ivory/75">WhatsApp: {formatPhone(brand.whatsappNumber)}</span>
          <span className="text-sm text-ivory/75">{brand.email}</span>
          <span className="text-sm text-ivory/75">{brand.schedule}</span>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gold">
            ¿Dónde entregamos?
          </h3>
          <ul className="flex flex-col gap-1 text-sm text-ivory/75">
            {coverageCities.map((city) => (
              <li key={city}>{city}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gold">
            Síguenos
          </h3>
          <div className="flex gap-3">
            <a
              href={brand.social.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/20 text-xs font-bold text-ivory transition hover:border-gold hover:text-gold"
            >
              IG
            </a>
            <a
              href={brand.social.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/20 text-xs font-bold text-ivory transition hover:border-gold hover:text-gold"
            >
              FB
            </a>
            <a
              href={`https://wa.me/${brand.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/20 text-ivory transition hover:border-gold hover:text-gold"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-ivory/10 px-4 py-5 text-center text-xs text-ivory/60 sm:px-6">
        © {new Date().getFullYear()} {brand.name}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
