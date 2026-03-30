import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import Providers from "./providers";

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
