"use client";
import { useSWRLite } from "@/lib/useSWRLite";
import Link from "next/link";

export default function RankingsPage() {
  const { data: dData } = useSWRLite("/api/rankings/donations", async (u) => (await fetch(u)).json());
  const { data: rData } = useSWRLite("/api/rankings/runner", async (u) => (await fetch(u)).json());
  const donations = dData?.rows || [];
  const runner = rData?.rows || [];

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-6 !text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold drop-shadow-lg !text-white">Rankings</h1>
        <Link href="/" className="bg-white/20 px-4 py-2 rounded-lg !text-white">Volver</Link>
      </div>

      <section className="bg-black/80 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-2 !text-white">Top Donaciones</h2>
        <div className="space-y-2">
          {donations.map((row, i) => (
            <div key={i} className="flex justify-between p-3 bg-white/5 rounded-lg border border-white/5">
              <span><span className="text-orange-400 font-bold mr-2">#{i + 1}</span>{row.nombreCompleto || row.email}</span>
              <span className="font-bold">{row.totalDonaciones} €</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ 
  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
  padding: '2rem', 
  borderRadius: '15px', 
  color: '#1a1a1a', 
  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
  margin: '1rem 0'
}}> className="bg-black/80 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-2 !text-white">Top Runner</h2>
        <div className="space-y-2">
          {runner.map((row, i) => (
            <div key={i} className="flex justify-between p-3 bg-white/5 rounded-lg border border-white/5">
              <span><span className="text-orange-400 font-bold mr-2">#{i + 1}</span>{row.nombreCompleto || row.email}</span>
              <span className="font-bold">{row.runnerBestScore} pts</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
