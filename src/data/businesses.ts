import type { BusinessType, ProteinCategoryOption } from "@/types/business.types";

/** Fuente: CMS & Content Bible, Capítulo 2 — "Centro de Negocios". */
export const businessTypes: BusinessType[] = [
  {
    id: "comida-rapida",
    label: "Comida rápida",
    icon: "Beef",
    description:
      "Ideal para negocios que preparan perros calientes, salchipapas, arepas, chuzos y otras comidas rápidas.",
  },
  {
    id: "asadero",
    label: "Asadero",
    icon: "Flame",
    description: "Productos ideales para parrillas, asados y restaurantes especializados en carnes.",
  },
  {
    id: "restaurante",
    label: "Restaurante",
    icon: "ChefHat",
    description: "Productos para restaurantes, almuerzos ejecutivos, hoteles y cocinas de producción.",
  },
  {
    id: "hogar",
    label: "Hogar",
    icon: "Home",
    description: "Compra la misma calidad que utilizan muchos negocios gastronómicos y recíbela en tu hogar.",
  },
  {
    id: "fitness",
    label: "Fitness",
    icon: "Dumbbell",
    description: "Proteínas seleccionadas para una alimentación rica en proteína y baja en grasa.",
  },
];

/** Fuente: CMS Capítulo 2 — "categorías principales de proteínas" (Res, Pollo y Cerdo). */
export const proteinCategories: ProteinCategoryOption[] = [
  { id: "res", label: "Res", description: "Cortes seleccionados de la mejor calidad." },
  { id: "pollo", label: "Pollo", description: "Fresco, natural y listo para tus recetas." },
  { id: "cerdo", label: "Cerdo", description: "Jugoso, tierno y perfecto para cualquier plato." },
];
