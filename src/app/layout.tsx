import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/features/cart/CartDrawer";
import { MobileCartBar } from "@/components/shared/MobileCartBar";
import { PriceSync } from "@/components/shared/PriceSync";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VANTRO | Proteínas Premium para Restaurantes y Negocios en Barranquilla",
  description:
    "Seleccionamos, porcionamos y empacamos al vacío carnes, pollo y cerdo para restaurantes, comidas rápidas y hogares en Barranquilla. Calidad constante, higiene y entregas confiables.",
  openGraph: {
    title: "VANTRO | Proteínas Premium para Restaurantes",
    description:
      "Calidad constante, empaque al vacío y entregas confiables para negocios gastronómicos.",
    images: ["/brand/logo-full.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <MobileCartBar />
        <PriceSync />
      </body>
    </html>
  );
}
