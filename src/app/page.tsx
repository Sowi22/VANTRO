import { Hero } from "@/features/hero/Hero";
import { ProteinCategories } from "@/features/protein-categories/ProteinCategories";
import { BusinessSelector } from "@/features/business-selector/BusinessSelector";
import { Catalog } from "@/features/catalog/Catalog";
import { WhyVantro } from "@/features/why-vantro/WhyVantro";
import { Faq } from "@/features/faq/Faq";
import { CtaFinal } from "@/features/cta-final/CtaFinal";

export default function Home() {
  return (
    <>
      <Hero />
      <ProteinCategories />
      <BusinessSelector />
      <Catalog />
      <WhyVantro />
      <Faq />
      <CtaFinal />
    </>
  );
}
