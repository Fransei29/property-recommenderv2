import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.scss";
import Providers from "../components/Providers/Providers";
import LayoutWrapper from "../components/LayoutWrapper/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Habita - Sistema de Recomendación de Propiedades",
  description: "Encuentra tu próxima propiedad con nuestro sistema inteligente de recomendaciones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
