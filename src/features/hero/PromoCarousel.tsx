"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Plus, Truck } from "lucide-react";
import { coverageCities } from "@/config/brand";
import { getBestOffer, isPurchasable, useCatalog } from "@/hooks/useCatalog";
import { formatCurrency } from "@/lib/currency";
import { imgurSrcSet, imgurVariant } from "@/lib/image";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import { useFlyToCartStore } from "@/store/fly-to-cart.store";
import type { Presentation, Product } from "@/types/product.types";

const AUTOPLAY_MS = 4500;
const MAX_PRODUCT_SLIDES = 5;

type Slide =
  | { kind: "product"; product: Product; presentation: Presentation; badge: string; isOffer: boolean }
  | { kind: "delivery" };

/**
 * Promociones del inicio. No se inventa ninguna oferta: las tarjetas salen
 * de la hoja de precios.
 * - Primero, productos con `precio_anterior` mayor al precio (descuento
 *   real): se muestran como "Oferta" con el precio anterior tachado.
 * - Luego, productos disponibles con foto, como destacados.
 * - Al final, la cobertura de entregas confirmada en `config/brand.ts`.
 * Para lanzar una promoción basta con llenar `precio_anterior` en la hoja.
 */
function useSlides(): Slide[] {
  const catalog = useCatalog();
  return useMemo(() => {
    const purchasable = catalog.filter(isPurchasable);
    const offers: Slide[] = purchasable.flatMap((product) => {
      const offer = getBestOffer(product);
      return offer
        ? [{ kind: "product" as const, product, presentation: offer, badge: "Oferta", isOffer: true }]
        : [];
    });
    const offerSkus = new Set(offers.map((s) => (s.kind === "product" ? s.product.sku : "")));
    const featured: Slide[] = purchasable
      .filter((p) => p.image && !offerSkus.has(p.sku))
      .map((product) => ({
        kind: "product" as const,
        product,
        presentation: product.presentations.find((p) => p.price != null) as Presentation,
        badge: "Destacado",
        isOffer: false,
      }));
    return [...offers, ...featured].slice(0, MAX_PRODUCT_SLIDES).concat({ kind: "delivery" });
  }, [catalog]);
}

export function PromoCarousel() {
  const slides = useSlides();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Índice activo según la tarjeta más visible (funciona con el dedo y con
  // el autoplay, sin escuchar el evento scroll).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { root: track, threshold: 0.6 },
    );
    track.querySelectorAll("[data-index]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => goTo((active + 1) % slides.length), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  });

  const goTo = (index: number) => {
    const track = trackRef.current;
    const target = track?.querySelector<HTMLElement>(`[data-index="${index}"]`);
    if (track && target) track.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior: "smooth" });
  };

  return (
    <div
      className="relative"
      onPointerDown={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carrusel"
      aria-label="Promociones y destacados"
    >
      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth"
      >
        {slides.map((slide, index) => (
          <div
            key={slide.kind === "product" ? slide.product.sku : "delivery"}
            data-index={index}
            className="w-full shrink-0 snap-center"
            aria-roledescription="diapositiva"
            aria-label={`${index + 1} de ${slides.length}`}
          >
            {slide.kind === "product" ? (
              <ProductSlide {...slide} eager={index === 0} />
            ) : (
              <DeliverySlide />
            )}
          </div>
        ))}
      </div>

      {slides.length > 1 ? (
        <div className="mt-3 flex justify-center gap-1.5">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setPaused(true);
                goTo(index);
              }}
              aria-label={`Ver promoción ${index + 1}`}
              className="flex h-6 items-center px-0.5"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-all duration-300",
                  index === active ? "w-6 bg-gold" : "w-1.5 bg-ivory/30",
                )}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ProductSlide({
  product,
  presentation,
  badge,
  isOffer,
  eager,
}: {
  product: Product;
  presentation: Presentation;
  badge: string;
  isOffer: boolean;
  eager: boolean;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const discount =
    isOffer && presentation.compareAtPrice && presentation.price
      ? Math.round((1 - presentation.price / presentation.compareAtPrice) * 100)
      : 0;

  const handleAdd = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    useFlyToCartStore.getState().launch({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    addItem({
      sku: product.sku,
      name: product.name,
      presentationLabel: presentation.label,
      unitPrice: presentation.price,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-[24px] bg-wine sm:aspect-[5/4]">
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgurVariant(product.image, "l")}
          srcSet={imgurSrcSet(product.image)}
          sizes="(max-width: 1024px) 92vw, 560px"
          alt={product.name}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-bordo via-bordo/40 to-transparent" />

      <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wide text-bordo">
        {discount > 0 ? `-${discount}% · ${badge}` : badge}
      </span>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-display text-2xl font-bold leading-tight text-ivory sm:text-3xl">
            {product.name}
          </span>
          <span className="flex items-baseline gap-2 text-ivory">
            <span className="text-lg font-bold">{formatCurrency(presentation.price as number)}</span>
            {isOffer && presentation.compareAtPrice ? (
              <span className="text-sm text-ivory/60 line-through">
                {formatCurrency(presentation.compareAtPrice)}
              </span>
            ) : null}
            <span className="text-sm text-ivory/70">· {presentation.label}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex h-12 shrink-0 items-center gap-1.5 rounded-full bg-ivory px-5 text-sm font-bold text-bordo shadow-lg transition active:scale-95"
        >
          {added ? "✓ Listo" : (
            <>
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Agregar
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function DeliverySlide() {
  return (
    <div className="relative flex aspect-square w-full flex-col justify-between overflow-hidden rounded-[24px] bg-gradient-to-br from-wine to-bordo p-6 sm:aspect-[5/4]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(214,174,98,0.25),transparent_55%)]" />
      <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold">
        <Truck className="h-7 w-7" strokeWidth={1.6} />
      </span>
      <div className="relative flex flex-col gap-3">
        <span className="font-display text-3xl font-bold leading-tight text-ivory">
          Te lo llevamos a tu negocio o tu casa
        </span>
        <span className="text-sm text-ivory/75">{coverageCities.join(" · ")}</span>
        <a
          href="#catalogo"
          className="mt-1 flex h-12 w-fit items-center gap-2 rounded-full bg-ivory px-5 text-sm font-bold text-bordo transition active:scale-95"
        >
          Armar mi pedido
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
