"use client";

import { useSWRLite } from "@/lib/useSWRLite";
import Link from "next/link";

type DonationRow = {
  userId: string;
  nombreCompleto: string | null;
  email: string;"use client";

import { useSWRLite } from "@/lib/useSWRLite";
import Link from "next/link";

export default function RankingsPage() {
  const { data: donationsData } = useSWRLite("/api/rankings/donations", async (url) => (await fetch(url)).json());
  const { data: runnerData } = useSWRLite("/api/rankings/runner", async (url) => (await fetch(url)).json());

  const donations = donationsData?.rows || [];
  const runner = runnerData?.rows || [];

  // Estilo común para las tarjetas
  const cardStyle = {
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "16px",
    padding: "24px",
    color: "#FFFFFF",
    marginBottom: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
  };

  const textWhite = { color: "#FFFFFF" };

  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#FFFFFF", fontSize: "2.5rem", fontWeight: "bold", margin: 0, textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
          Rankings Solidarios
        </h1>
        <Link href="/" style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#FFF", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>
          Volver
        </Link>
      </div>

      {/* BLOQUE DONACIONES */}
      <section style={cardStyle}>
        <h2 style={{ color: "#FFFFFF", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px", marginBottom: "20px" }}>
          Top Donaciones (Zarpa Karma)
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {donations.map((row, i) => (
            <div key={row.userId} style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={textWhite}>
                <strong style={{ color: "#60a5fa", marginRight: "10px" }}>#{i + 1}</strong>
                {row.nombreCompleto || row.email}
              </span>
              <span style={{ color: "#FFFFFF", fontWeight: "bold" }}>
                {row.karmaPoints} pts · {row.totalDonaciones} €
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* BLOQUE RUNNER */}
      <section style={cardStyle}>
        <h2 style={{ color: "#FFFFFF", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px", marginBottom: "20px" }}>
          Top Gatito Runner
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {runner.map((row, i) => (
            <div key={row.userId} style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={textWhite}>
                <strong style={{ color: "#fb923c", marginRight: "10px" }}>#{i + 1}</strong>
                {row.nombreCompleto || row.email}
              </span>
              <span style={{ color: "#FFFFFF", fontWeight: "bold" }}>
                {row.runnerBestScore} puntos
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
"use client";

import { useSWRLite } from "@/lib/useSWRLite";
import Link from "next/link";

export default function RankingsPage() {
  const { data: donationsData } = useSWRLite("/api/rankings/donations", async (url) => (await fetch(url)).json());
  const { data: runnerData } = useSWRLite("/api/rankings/runner", async (url) => (await fetch(url)).json());

  const donations = donationsData?.rows || [];
  const runner = runnerData?.rows || [];

  // Estilo común para las tarjetas
  const cardStyle = {
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "16px",
    padding: "24px",
    color: "#FFFFFF",
    marginBottom: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
  };

  const textWhite = { color: "#FFFFFF" };

  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#FFFFFF", fontSize: "2.5rem", fontWeight: "bold", margin: 0, textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
          Rankings Solidarios
        </h1>
        <Link href="/" style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#FFF", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>
          Volver
        </Link>
      </div>

      {/* BLOQUE DONACIONES */}
      <section style={cardStyle}>
        <h2 style={{ color: "#FFFFFF", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px", marginBottom: "20px" }}>
          Top Donaciones (Zarpa Karma)
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {donations.map((row, i) => (
            <div key={row.userId} style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={textWhite}>
                <strong style={{ color: "#60a5fa", marginRight: "10px" }}>#{i + 1}</strong>
                {row.nombreCompleto || row.email}
              </span>
              <span style={{ color: "#FFFFFF", fontWeight: "bold" }}>
                {row.karmaPoints} pts · {row.totalDonaciones} €
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* BLOQUE RUNNER */}
      <section style={cardStyle}>
        <h2 style={{ color: "#FFFFFF", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px", marginBottom: "20px" }}>
          Top Gatito Runner
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {runner.map((row, i) => (
            <div key={row.userId} style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={textWhite}>
                <strong style={{ color: "#fb923c", marginRight: "10px" }}>#{i + 1}</strong>
                {row.nombreCompleto || row.email}
              </span>
              <span style={{ color: "#FFFFFF", fontWeight: "bold" }}>
                {row.runnerBestScore} puntos
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

  karmaPoints: number;
  totalDonaciones: number;
};

type RunnerRow = {
  userId: string;
  nombreCompleto: string | null;
  email: string;
  runnerBestScore: number;
};

const fetcher = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error cargando ${url}: ${response.status}`);
  }
  return response.json();
};

export default function RankingsPage() {
  const {
    data: donationsData,
    error: donationsError,
    isLoading: donationsLoading,
  } = useSWRLite<{ rows: DonationRow[] }>("/api/rankings/donations", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });

  const {
    data: runnerData,
    error: runnerError,
    isLoading: runnerLoading,
  } = useSWRLite<{ rows: RunnerRow[] }>("/api/rankings/runner", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });

  const donations = donationsData?.rows || [];
  const runner = runnerData?.rows || [];

  return (
    <main className="max-w-[880px] mx-auto p-4 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="!text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-3xl font-bold">
          Rankings solidarios
        </h1>
        <Link href="/" className="bg-white/20 hover:bg-white/30 !text-white px-4 py-2 rounded-lg backdrop-blur-md transition-all">
          Volver
        </Link>
      </div>

      {/* SECCIÓN 1: DONACIONES */}
      <section className="bg-black/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
        <h2 className="!text-white border-b border-white/10 pb-3 mb-4 text-xl font-semibold">
          Top donaciones (Zarpa Karma)
        </h2>
        
        {donationsLoading && <p className="!text-white/70 italic">Cargando ranking...</p>}
        {donationsError && <p className="text-red-400">Error al cargar datos.</p>}
        
        {!donationsLoading && !donationsError && (
          <ol className="space-y-3">
            {donations.map((row, index) => (
              <li key={row.userId} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                <span className="!text-white font-medium">
                  <span className="text-blue-400 mr-2">#{index + 1}</span>
                  {row.nombreCompleto || row.email || "Usuario"}
                </span>
                <span className="!text-white font-bold bg-blue-600/30 px-3 py-1 rounded-full text-sm">
                  {Number(row.karmaPoints || 0)} pts · {Number(row.totalDonaciones || 0)} €
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* SECCIÓN 2: RUNNER */}
      <section className="bg-black/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
        <h2 className="!text-white border-b border-white/10 pb-3 mb-4 text-xl font-semibold">
          Top Gatito Runner
        </h2>
        
        {runnerLoading && <p className="!text-white/70 italic">Cargando ranking...</p>}
        {runnerError && <p className="text-red-400">Error al cargar datos.</p>}
        
        {!runnerLoading && !runnerError && (
          <ol className="space-y-3">
            {runner.map((row, index) => (
              <li key={row.userId} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                <span className="!text-white font-medium">
                  <span className="text-orange-400 mr-2">#{index + 1}</span>
                  {row.nombreCompleto || row.email || "Usuario"}
                </span>
                <span className="!text-white font-bold bg-orange-600/30 px-3 py-1 rounded-full text-sm">
                  {Number(row.runnerBestScore || 0)} puntos
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
    }
