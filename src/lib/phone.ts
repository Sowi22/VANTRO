/** Formatea un número colombiano "573043989146" como "+57 304 398 9146". */
export function formatPhone(whatsappNumber: string): string {
  const match = whatsappNumber.match(/^57(\d{3})(\d{3})(\d{4})$/);
  if (!match) return `+${whatsappNumber}`;
  const [, prefix, middle, suffix] = match;
  return `+57 ${prefix} ${middle} ${suffix}`;
}
