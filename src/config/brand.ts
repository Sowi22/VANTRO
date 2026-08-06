/**
 * Configuración global de la empresa (CMS Cap. 17).
 * TODO: reemplazar los valores marcados como placeholder cuando se resuelvan
 * las preguntas pendientes del análisis de arquitectura (redes sociales,
 * dirección, IDs de analítica).
 */
export const brand = {
  name: "VANTRO",
  tagline: "Distribuidora de Carnes",
  slogan: "Calidad que impulsa tu cocina.",
  whatsappNumber: "573043989146",
  email: "ventas@vantro.co",
  schedule: "Lunes a Sábado · 6:00 a.m. – 6:00 p.m.",
  social: {
    instagram: "https://instagram.com/vantro",
    facebook: "https://facebook.com/vantro",
    tiktok: "https://tiktok.com/@vantro",
  },
} as const;

/** Fuente: PRD §15.3 / CMS Cap. 10 — cobertura inicial de entregas. */
export const coverageCities = [
  "Barranquilla",
  "Soledad",
  "Puerto Colombia",
  "Galapa",
  "Malambo",
] as const;
