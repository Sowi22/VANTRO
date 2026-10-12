"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";
import { formatCurrency } from "@/lib/currency";
import { imgurSrcSet, imgurVariant } from "@/lib/image";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import { useFlyToCartStore } from "@/store/fly-to-cart.store";
import type { Product } from "@/types/product.types";

const statusMessage: Record<string, string> = {
  agotado: "Agotado temporalmente",
  proximamente: "Disponible muy pronto",
  pendiente: "Consulta disponibilidad y precio por WhatsApp",
};

interface ProductCardProps {
  product: Product;
  onAdded?: () => void;
  /** Posición en la cuadrícula, para escalonar la animación de entrada. */
  index?: number;
}

export function ProductCard({ product, onAdded, index = 0 }: ProductCardProps) {
  const [presentationIndex, setPresentationIndex] = useState(() => {
    const firstWithPrice = product.presentations.findIndex((p) => p.price != null);
    return firstWithPrice >= 0 ? firstWithPrice : 0;
  });
  const [justAdded, setJustAdded] = useState(false);
  // Si el link pegado en la hoja de precios no carga (formato incorrecto,
  // imagen borrada, etc.), volvemos al ícono de relleno en vez de mostrar
  // una imagen rota. Se reinicia si el producto cambia de foto.
  const [imgError, setImgError] = useState(false);
  useEffect(() => setImgError(false), [product.image]);

  const presentation = product.presentations[presentationIndex];
  const addItem = useCartStore((s) => s.addItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const quantityInCart = useCartStore(
    (s) =>
      s.items.find(
        (i) => i.sku === product.sku && i.presentationLabel === presentation.label,
      )?.quantity ?? 0,
  );

  const isAvailable = product.status === "activo" && presentation.price != null;

  const launchFly = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    useFlyToCartStore.getState().launch({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  };

  const handleAdd = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!isAvailable) return;
    launchFly(event);
    addItem({
      sku: product.sku,
      name: product.name,
      presentationLabel: presentation.label,
      unitPrice: presentation.price,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1000);
    onAdded?.();
  };

  const showPresentationPicker = useMemo(
    () => product.presentations.length > 1,
    [product.presentations.length],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-3 rounded-[20px] border border-charcoal/10 bg-surface p-2.5 shadow-[0_1px_2px_rgba(38,35,34,0.04)] transition-shadow hover:shadow-[0_12px_30px_rgba(58,8,12,0.10)] sm:p-3"
    >
      <div className="relative">
        {product.image && !imgError ? (
          <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-surface">
            {product.image.startsWith("http") ? (
              // Foto pegada desde la hoja de precios (imgur, Drive, etc): dominio
              // no conocido de antemano, así que se muestra sin optimizar en vez
              // de exigir configurar next/image para cada dominio posible.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imgurVariant(product.image, "m")}
                srcSet={imgurSrcSet(product.image)}
                sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 230px"
                alt={product.name}
                loading="lazy"
                decoding="async"
                onError={() => setImgError(true)}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            ) : (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 45vw, 220px"
                onError={() => setImgError(true)}
                className="object-cover"
              />
            )}
          </div>
        ) : (
          <MediaPlaceholder category={product.proteinCategory} className="aspect-square w-full" />
        )}
        {product.tags[0] ? (
          <Badge className="absolute left-2 top-2" variant="default">
            {product.tags[0]}
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <h3 className="text-[15px] font-semibold leading-tight text-foreground">{product.name}</h3>

        {showPresentationPicker ? (
          <div className="flex flex-wrap gap-1.5 py-1">
            {product.presentations.map((p, index) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setPresentationIndex(index)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition",
                  index === presentationIndex
                    ? "border-primary bg-primary text-ivory"
                    : "border-charcoal/15 text-muted hover:border-charcoal/30",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted">{presentation.label}</span>
        )}

        {isAvailable ? (
          <span className="flex items-baseline gap-2">
            <span className="text-base font-bold text-foreground">
              {formatCurrency(presentation.price as number)}
            </span>
            {presentation.compareAtPrice && presentation.compareAtPrice > (presentation.price as number) ? (
              <span className="text-xs text-muted line-through">
                {formatCurrency(presentation.compareAtPrice)}
              </span>
            ) : null}
          </span>
        ) : (
          <span className="text-xs font-medium text-primary">
            {statusMessage[product.status] ?? "Consulta disponibilidad"}
          </span>
        )}
      </div>

      {isAvailable ? (
        quantityInCart > 0 ? (
          <div className="flex h-11 items-center justify-between rounded-[18px] bg-primary/5 px-1.5">
            <button
              type="button"
              aria-label="Disminuir cantidad"
              onClick={() =>
                setQuantity(product.sku, presentation.label, quantityInCart - 1)
              }
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:bg-charcoal/15 active:scale-95"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-foreground">{quantityInCart}</span>
            <button
              type="button"
              aria-label="Aumentar cantidad"
              onClick={(event) => {
                launchFly(event);
                setQuantity(product.sku, presentation.label, quantityInCart + 1);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:bg-charcoal/15 active:scale-95"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Button size="sm" className="h-11 w-full" onClick={handleAdd}>
            {justAdded ? "✓ Agregado" : "Agregar"}
          </Button>
        )
      ) : (
        <Button size="sm" variant="secondary" className="h-11 w-full" disabled>
          {product.status === "agotado" ? "Agotado" : "Próximamente"}
        </Button>
      )}
    </motion.div>
  );
}
