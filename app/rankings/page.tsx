"use client";

import { useSWRLite } from "@/lib/useSWRLite";

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
    <main className="mx-auto grid max-w-[880px] gap-4 p-4 text-slate-900">
      <h1 className="text-3xl font-bold text-slate-900">Rankings solidarios</h1>

      <section className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-2xl shadow-black/20 text-slate-900">
        <h2 className="mb-4 border-b border-gray-200 pb-2 font-bold text-slate-900">Top donaciones (Zarpa Karma)</h2>
        {donationsLoading && <p className="text-slate-700">Cargando ranking de donaciones...</p>}
        {donationsError && <p className="text-red-700">No se pudo cargar el ranking de donaciones.</p>}
        {!donationsLoading && !donationsError && (
          <ol className="space-y-2">
            {donations.map((row) => (
              <li
                className="flex justify-between items-center p-3 rounded-lg bg-gray-100/50 border border-gray-200 text-slate-900"
                key={row.userId}
              >
                <span className="font-medium">{row.nombreCompleto || row.email || "Usuario"}</span>
                <span className="text-slate-700">
                  {Number(row.karmaPoints || 0)} puntos · {Number(row.totalDonaciones || 0)} €
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-2xl shadow-black/20 text-slate-900">
        <h2 className="mb-4 border-b border-gray-200 pb-2 font-bold text-slate-900">Top Gatito Runner</h2>
        {runnerLoading && <p className="text-slate-700">Cargando ranking de runner...</p>}
        {runnerError && <p className="text-red-700">No se pudo cargar el ranking de runner.</p>}
        {!runnerLoading && !runnerError && (
          <ol className="space-y-2">
            {runner.map((row) => (
              <li
                className="flex justify-between items-center p-3 rounded-lg bg-gray-100/50 border border-gray-200 text-slate-900"
                key={row.userId}
              >
                <span className="font-medium">{row.nombreCompleto || row.email || "Usuario"}</span>
                <span className="text-slate-700">{Number(row.runnerBestScore || 0)} puntos</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
