import { Hero } from "@/features/hero/Hero";
import { Catalog } from "@/features/catalog/Catalog";
import { WhyVantro } from "@/features/why-vantro/WhyVantro";
import { Faq } from "@/features/faq/Faq";
import { CtaFinal } from "@/features/cta-final/CtaFinal";

export default function Home() {
  return (
    <>
      <Hero />
      <Catalog />
      <WhyVantro />
      <Faq />
      <CtaFinal />
    </>
  );
}
