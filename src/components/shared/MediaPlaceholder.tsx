import { Beef, Bone, Drumstick, ImageOff, Sandwich } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProteinCategory } from "@/types/product.types";

/**
 * VANTRO todavía no cuenta con fotografía profesional real (ver Pregunta 2
 * del análisis de arquitectura). Mientras tanto, la interfaz utiliza un
 * placeholder elegante por categoría en vez de imágenes genéricas de stock,
 * tal como exige CMS Cap. 18 §11 ("Imagen próximamente").
 */
const iconByCategory: Record<ProteinCategory, React.ComponentType<{ className?: string }>> = {
  res: Beef,
  pollo: Drumstick,
  cerdo: Beef,
  visceras: Bone,
  complemento: Sandwich,
  mixto: Beef,
};

interface MediaPlaceholderProps {
  category?: ProteinCategory;
  className?: string;
  label?: string;
}

export function MediaPlaceholder({ category, className, label }: MediaPlaceholderProps) {
  const Icon = category ? iconByCategory[category] : ImageOff;
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-[20px] bg-gradient-to-br from-surface via-surface to-black",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(217,4,41,0.18),transparent_60%)]" />
      <Icon className="relative h-10 w-10 text-white/25" strokeWidth={1.5} />
      <span className="relative text-[11px] font-medium uppercase tracking-wide text-white/25">
        {label ?? "Imagen próximamente"}
      </span>
    </div>
  );
}
