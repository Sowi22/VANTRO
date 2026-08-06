"use client";

import { Beef, ChefHat, Dumbbell, Flame, Home, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessType } from "@/types/business.types";

const icons: Record<BusinessType["icon"], LucideIcon> = {
  Beef,
  Flame,
  ChefHat,
  Home,
  Dumbbell,
};

interface BusinessCardProps {
  business: BusinessType;
  active: boolean;
  onSelect: () => void;
}

export function BusinessCard({ business, active, onSelect }: BusinessCardProps) {
  const Icon = icons[business.icon];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex min-h-[150px] flex-col items-center justify-center gap-3 rounded-[20px] border p-4 text-center transition active:scale-[0.98]",
        active
          ? "border-primary bg-primary text-white shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
          : "border-white/[0.06] bg-surface text-white hover:border-white/20",
      )}
    >
      <Icon className="h-7 w-7" strokeWidth={1.5} />
      <span className="text-sm font-semibold leading-tight">{business.label}</span>
    </button>
  );
}
