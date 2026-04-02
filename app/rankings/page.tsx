"use client";

import { useSWRLite } from "@/lib/useSWRLite";
import Link from "next/link";

type DonationRow = {
  userId: string;
  nombreCompleto: string | null;
  email: string;
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
