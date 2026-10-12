import type { Metadata, Viewport } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/features/cart/CartDrawer";
import { MobileCartBar } from "@/components/shared/MobileCartBar";
import { PriceSync } from "@/components/shared/PriceSync";
import { getPriceSheetData } from "@/lib/price-sheet";
import { FlyToCartLayer } from "@/components/shared/FlyToCartLayer";

// Sistema tipográfico del brief (§4): Playfair Display para títulos,
// Montserrat para textos y botones. next/font las sirve desde el mismo
// dominio, sin pedirlas a Google en cada visita.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Carnes Vantro",
  description:
    "Seleccionamos, porcionamos y empacamos al vacío carnes, pollo y cerdo para restaurantes, comidas rápidas y hogares en Barranquilla. Calidad constante, higiene y entregas confiables.",
  openGraph: {
    title: "Carnes Vantro",
    description:
      "Calidad constante, empaque al vacío y entregas confiables para negocios gastronómicos.",
    images: ["/brand/logo-full.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#3a080c",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const priceData = await getPriceSheetData();

  return (
    <html lang="es" className={`${montserrat.variable} ${playfair.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <PriceSync initialData={priceData}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <MobileCartBar />
          <FlyToCartLayer />
        </PriceSync>
      </body>
    </html>
  );
}
