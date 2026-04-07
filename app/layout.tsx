import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import Providers from "./providers";
import SessionHeader from "./components/SessionHeader";
import ConfettiEffect from "./components/ConfettiEffect"; // Asegúrate de haber creado este archivo
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GatoCan Natura Rural",
  description: "Plataforma solidaria GatoCan con perfil, foro y Gatito Runner",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          {/* Suspense es necesario para usar useSearchParams en el confeti */}
          <Suspense fallback={null}>
            <ConfettiEffect />
          </Suspense>
          
          <SessionHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}