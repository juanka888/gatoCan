"use client";

import { getSession, signIn } from "next-auth/react";
import HeaderPrincipal from "@/app/components/HeaderPrincipal";
import DonationStats from "@/app/components/DonationStats";
import DonationSection from "@/app/components/DonationSection";
import { gatosColonia } from "@/lib/gatos";

const card: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.85)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(229, 231, 235, 0.5)",
  borderRadius: "16px",
  padding: "1.25rem",
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
  justifySelf: "center",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
  margin: "0 auto",
  overflow: "hidden",
};

const mainContainerStyle: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "1rem 15px",
  display: "grid",
  gridTemplateColumns: "100%",
  gap: "1.2rem",
  boxSizing: "border-box",
  minHeight: "100vh",
};

export default function DonacionesPage() {
  const handlePayment = async (name: string, amount: number) => {
    try {
      const session = await getSession();

      let identity = "anonymous@gatocan.com";

      if (!session) {
        const confirmar = confirm(
          "Estás donando sin sesión. Los puntos irán a la cuenta global de anónimos. ¿Continuar?",
        );

        if (!confirmar) {
          signIn();
          return;
        }
      } else {
        identity = session.user?.email || "anonymous@gatocan.com";
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          amount,
          userId: identity,
        }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert("Stripe dice: " + (data.error || "Error desconocido"));
      }
    } catch {
      alert("Error de red al intentar pagar");
    }
  };

  return (
    <main style={mainContainerStyle}>
      <HeaderPrincipal />

      <section style={card}>
        <h1
          style={{
            textAlign: "center",
            margin: 0,
            color: "#0f4c5c",
            fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
          }}
        >
          Apoya a nuestra colonia
        </h1>
      </section>

      <section style={card}>
        <DonationStats />
      </section>

      <DonationSection gatosColonia={gatosColonia} handlePayment={handlePayment} cardStyle={card} />
    </main>
  );
}
