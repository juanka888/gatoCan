import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import Providers from "./providers";
import SessionHeader from "./components/SessionHeader";
import GatoAsistente from "./components/GatoAsistente";

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
          {/* En tu layout.tsx */}
<div style={{ 
  position: 'absolute', 
  top: '20px', 
  right: '20px', 
  zIndex: 1500 
}}>
  <SessionHeader />
</div>
          
          
          {children}
          <GatoAsistente />
        </Providers>
      </body>
    </html>
  );
}
