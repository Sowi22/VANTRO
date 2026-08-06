"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import type { Product } from "@/types/product.types";

const statusMessage: Record<string, string> = {
  agotado: "Agotado temporalmente",
  proximamente: "Disponible muy pronto",
  pendiente: "Consulta disponibilidad y precio por WhatsApp",
};

interface ProductCardProps {
  product: Product;
  onAdded?: () => void;
}

export function ProductCard({ product, onAdded }: ProductCardProps) {
  const [presentationIndex, setPresentationIndex] = useState(() => {
    const firstWithPrice = product.presentations.findIndex((p) => p.price != null);
    return firstWithPrice >= 0 ? firstWithPrice : 0;
  });
  const [justAdded, setJustAdded] = useState(false);

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

  const handleAdd = () => {
    if (!isAvailable) return;
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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-3 rounded-[20px] border border-white/[0.06] bg-surface p-3"
    >
      <div className="relative">
        {product.image ? (
          <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-surface">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 45vw, 220px"
              className="object-cover"
            />
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
        <h3 className="text-sm font-semibold leading-tight text-white">{product.name}</h3>

        {showPresentationPicker ? (
          <div className="flex flex-wrap gap-1.5 py-1">
            {product.presentations.map((p, index) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setPresentationIndex(index)}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px] font-medium transition",
                  index === presentationIndex
                    ? "border-primary bg-primary/15 text-white"
                    : "border-white/10 text-muted hover:border-white/25",
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
            <span className="text-base font-bold text-white">
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
          <div className="flex h-11 items-center justify-between rounded-[18px] bg-white/5 px-2">
            <button
              type="button"
              aria-label="Disminuir cantidad"
              onClick={() =>
                setQuantity(product.sku, presentation.label, quantityInCart - 1)
              }
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/10 active:scale-95"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-white">{quantityInCart}</span>
            <button
              type="button"
              aria-label="Aumentar cantidad"
              onClick={() =>
                setQuantity(product.sku, presentation.label, quantityInCart + 1)
              }
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/10 active:scale-95"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Button size="sm" className="w-full" onClick={handleAdd}>
            {justAdded ? "✓ Agregado" : "Agregar"}
          </Button>
        )
      ) : (
        <Button size="sm" variant="secondary" className="w-full" disabled>
          {product.status === "agotado" ? "Agotado" : "Próximamente"}
        </Button>
      )}
    </motion.div>
  );
}
