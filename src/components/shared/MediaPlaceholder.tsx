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
        "relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-[20px] bg-gradient-to-br from-wine via-primary to-primary",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(214,174,98,0.22),transparent_60%)]" />
      <Icon className="relative h-10 w-10 text-gold/60" strokeWidth={1.5} />
      <span className="relative text-[11px] font-medium uppercase tracking-wide text-ivory/50">
        {label ?? "Imagen próximamente"}
      </span>
    </div>
  );
}
