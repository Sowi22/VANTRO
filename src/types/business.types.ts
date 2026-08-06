import type { BusinessSegment, ProteinCategory } from "./product.types";

export interface BusinessType {
  id: BusinessSegment;
  label: string;
  icon: "Beef" | "Flame" | "ChefHat" | "Home" | "Dumbbell";
  description: string;
}

export interface ProteinCategoryOption {
  id: ProteinCategory;
  label: string;
  description: string;
}
