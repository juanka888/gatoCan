"use client";

import { useSWRLite } from "@/lib/useSWRLite";
import Link from "next/link";

type DonationRow = { userId: string; nombreCompleto: string | null; email: string; karmaPoints: number; totalDonaciones: number; };
type RunnerRow = { userId: string; nombreCompleto: string | null; email: string; runnerBestScore: number; runnerBestDistanceM: number; };

export default function RankingsPage() {
  const { data: dData } = useSWRLite<{ rows: DonationRow[] }>("/api/rankings/donations", async (u) => (await fetch(u)).json());
  const { data: rData } = useSWRLite<{ rows: RunnerRow[] }>("/api/rankings/runner", async (u) => (await fetch(u)).json());
  
  // Cargamos el mismo endpoint de runner pero lo ordenaremos por distancia en el cliente o puedes crear /api/rankings/distance
  const donations = dData?.rows || [];
  const runnerScore = rData?.rows || [];
  
  // Ordenamos por distancia para el nuevo ranking
  const runnerDistance = [...runnerScore].sort((a, b) => b.runnerBestDistanceM - a.runnerBestDistanceM);

  const glassCard = {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '24px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
    color: '#FFFFFF'
  };

  const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    marginBottom: '10px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  return (
    <main style={{ maxWidth: '850px', margin: '0 auto', padding: '2rem', minHeight: '100vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#FFFFFF', fontSize: '2.5rem', fontWeight: '800', margin: 0, textShadow: '2px 4px 8px rgba(0,0,0,0.3)' }}>
          Rankings Solidarios
        </h1>
        <Link href="/" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFF', padding: '10px 20px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', backdropFilter: 'blur(10px)' }}>
          Volver
        </Link>
      </div>

      {/* RANKING 1: KARMA */}
      <section style={glassCard}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '15px', marginBottom: '20px', fontWeight: 'bold' }}>
          🏆 Top Zarpa Karma (Donaciones)
        </h2>
        <div>
          {donations.length === 0 ? <p>Cargando podio...</p> : donations.map((row, i) => (
            <div key={row.userId} style={rowStyle}>
              <span><strong style={{ color: '#FFD700', marginRight: '10px' }}>#{i + 1}</strong>{row.nombreCompleto || row.email || "Usuario"}</span>
              <span style={{ fontWeight: '800' }}>{row.karmaPoints} pts</span>
            </div>
          ))}
        </div>
      </section>

      {/* RANKING 2: PUNTOS RUNNER */}
      <section style={glassCard}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '15px', marginBottom: '20px', fontWeight: 'bold' }}>
          🎮 Top Puntuación (Cazando objetos)
        </h2>
        <div>
          {runnerScore.length === 0 ? <p>Cargando datos...</p> : runnerScore.map((row, i) => (
            <div key={row.userId} style={rowStyle}>
              <span><strong style={{ color: '#70d6ff', marginRight: '10px' }}>#{i + 1}</strong>{row.nombreCompleto || row.email || "Usuario"}</span>
              <span style={{ fontWeight: '800' }}>{row.runnerBestScore} pts</span>
            </div>
          ))}
        </div>
      </section>

      {/* RANKING 3: NUEVO - DISTANCIA RECORRIDA */}
      <section style={glassCard}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '15px', marginBottom: '20px', fontWeight: 'bold' }}>
          🏃‍♂️ Top Maratonianos (Distancia)
        </h2>
        <div>
          {runnerDistance.length === 0 ? <p>Esperando corredores...</p> : runnerDistance.map((row, i) => (
            <div key={row.userId} style={rowStyle}>
              <span><strong style={{ color: '#a29bfe', marginRight: '10px' }}>#{i + 1}</strong>{row.nombreCompleto || row.email || "Usuario"}</span>
              <span style={{ fontWeight: '800' }}>{row.runnerBestDistanceM} metros</span>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
