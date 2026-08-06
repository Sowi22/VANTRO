"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { brand } from "@/config/brand";

export function WhatsappFloatingButton() {
  const message = encodeURIComponent("Hola VANTRO 👋\nEstoy interesado en conocer sus productos. ¿Podrían ayudarme?");

  return (
    <motion.a
      href={`https://wa.me/${brand.whatsappNumber}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Hablar por WhatsApp"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.3 }}
      className="fixed bottom-5 left-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-success text-white shadow-[0_10px_30px_rgba(0,0,0,0.3)] active:scale-95"
    >
      <MessageCircle className="h-6 w-6" />
    </motion.a>
  );
}
