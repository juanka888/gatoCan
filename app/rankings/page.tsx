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
    <main className="mx-auto grid max-w-[880px] gap-4 p-6 !text-white">
      <h1 className="!text-white text-3xl font-bold">
        Rankings solidarios
      </h1>

      <section className="bg-black/80 backdrop-blur-lg border border-white/20 rounded-xl p-6 !text-white">
        <h2 className="!text-white border-b border-white/20 pb-2 mb-4 font-semibold">
          Top donaciones (Zarpa Karma)
        </h2>
        {donationsLoading && <p className="!text-white">Cargando ranking de donaciones...</p>}
        {donationsError && <p className="!text-white">No se pudo cargar el ranking de donaciones.</p>}
        {!donationsLoading && !donationsError && (
          <ol className="list-decimal list-inside space-y-2">
            {donations.map((row) => (
              <li className="!text-white" key={row.userId}>
                <span className="!text-white font-medium">{row.nombreCompleto || row.email || "Usuario"}</span>{" "}
                <span className="!text-white">
                  — {Number(row.karmaPoints || 0)} puntos · {Number(row.totalDonaciones || 0)} €
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="bg-black/80 backdrop-blur-lg border border-white/20 rounded-xl p-6 !text-white">
        <h2 className="!text-white border-b border-white/20 pb-2 mb-4 font-semibold">Top Gatito Runner</h2>
        {runnerLoading && <p className="!text-white">Cargando ranking de runner...</p>}
        {runnerError && <p className="!text-white">No se pudo cargar el ranking de runner.</p>}
        {!runnerLoading && !runnerError && (
          <ol className="list-decimal list-inside space-y-2">
            {runner.map((row) => (
              <li className="!text-white" key={row.userId}>
                <span className="!text-white font-medium">{row.nombreCompleto || row.email || "Usuario"}</span>
                <span className="!text-white"> — {Number(row.runnerBestScore || 0)} puntos</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
