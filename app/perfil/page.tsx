"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type ProfileData = {
  nombreCompleto: string;
  telefono: string;
  dniNie: string;
  direccion: string;
  codigoPostal: string;
  poblacion: string;
  karmaPoints: number;
  totalDonaciones: number;
  runnerBestScore: number;
  runnerBestDistanceM: number;
  aceptaPoliticas: boolean;
};

const emptyProfile: ProfileData = {
  nombreCompleto: "",
  telefono: "",
  dniNie: "",
  direccion: "",
  codigoPostal: "",
  poblacion: "",
  karmaPoints: 0,
  totalDonaciones: 0,
  runnerBestScore: 0,
  runnerBestDistanceM: 0,
  aceptaPoliticas: false,
};

const dniLetters = "TRWAGMYFPDXBNJZSQVHLCKE";

function normalizeDni(value: string): string {
  return value.replace(/\s|-/g, "").toUpperCase();
}

function isValidDni(value: string): boolean {
  const dni = normalizeDni(value);
  if (!/^\d{8}[A-Z]$/.test(dni)) {
    return false;
  }

  const number = Number(dni.slice(0, 8));
  const expectedLetter = dniLetters[number % 23];
  return dni[8] === expectedLetter;
}

const glassCard = "bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6";
const inputClass =
  "w-full bg-black/40 text-white border border-white/10 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed placeholder:text-slate-400";

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (status !== "authenticated") {
        setLoading(false);
        return;
      }

      const response = await fetch("/api/profile");
      if (!response.ok) {
        setErrorMessage("No se pudo cargar tu perfil.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      const p = data.profile || {};
      setProfile({
        nombreCompleto: p.nombreCompleto || session?.user?.name || "",
        telefono: p.telefono || "",
        dniNie: p.dniNie || "",
        direccion: p.direccion || "",
        codigoPostal: p.codigoPostal || "",
        poblacion: p.poblacion || "",
        karmaPoints: Number(p.karmaPoints || 0),
        totalDonaciones: Number(p.totalDonaciones || 0),
        runnerBestScore: Number(p.runnerBestScore || 0),
        runnerBestDistanceM: Number(p.runnerBestDistanceM || 0),
        aceptaPoliticas: Boolean(p.aceptaPoliticas),
      });
      setLoading(false);
    };

    loadProfile();
  }, [session?.user?.name, status]);

  const updateField = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setMessage("");

    if (field === "dniNie") {
      const nextDni = normalizeDni(value);
      if (nextDni.length > 0 && !isValidDni(nextDni)) {
        setErrorMessage("El DNI no es válido. Debe tener 8 números y una letra de control correcta.");
      } else {
        setErrorMessage("");
      }
    }
  };

  const saveProfile = async () => {
    setMessage("");
    setErrorMessage("");

    const normalizedDni = normalizeDni(profile.dniNie);
    if (normalizedDni && !isValidDni(normalizedDni)) {
      setErrorMessage("El DNI no es válido. Revísalo antes de guardar.");
      return;
    }

    if (!profile.aceptaPoliticas) {
      setErrorMessage("Debes aceptar las políticas para guardar tu perfil.");
      return;
    }

    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombreCompleto: profile.nombreCompleto,
        telefono: profile.telefono,
        dniNie: normalizedDni,
        direccion: profile.direccion,
        codigoPostal: profile.codigoPostal,
        poblacion: profile.poblacion,
        aceptaPoliticas: profile.aceptaPoliticas,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setErrorMessage(data?.error || "No se pudo guardar el perfil.");
      return;
    }

    setProfile((prev) => ({ ...prev, dniNie: normalizedDni }));
    setEditing(false);
    setMessage("Perfil actualizado correctamente.");
  };

  if (status === "loading" || loading) {
    return <main className="mx-auto grid min-h-screen w-full max-w-5xl place-items-center bg-slate-950 px-6 py-8 text-slate-100">Cargando perfil...</main>;
  }

  if (status !== "authenticated") {
    return (
      <main className="mx-auto grid min-h-screen w-full max-w-5xl bg-slate-950 px-6 py-8 text-slate-100">
        <section className={`${glassCard} mx-auto mt-10 w-full max-w-xl space-y-5`}>
          <h1 className="text-3xl font-bold text-white">Mi perfil</h1>
          <p className="text-slate-200">Necesitas iniciar sesión para ver y editar tu perfil.</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-md border border-white/20 bg-black/40 px-4 py-2 font-semibold text-white transition hover:bg-white/10"
              onClick={() => signIn("google", { callbackUrl: "/perfil" })}
            >
              Acceder con Google
            </button>
            <Link href="/" className="rounded-md border border-white/20 bg-black/40 px-4 py-2 font-semibold text-white transition hover:bg-white/10">
              Volver al inicio
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto grid w-full max-w-4xl gap-6">
        <section className={`${glassCard} flex flex-wrap items-center justify-between gap-4`}>
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-3xl font-bold text-white shadow-lg shadow-emerald-500/30">g</div>
            <div>
              <h1 className="text-3xl font-bold text-white">Mi perfil</h1>
              <p className="text-lg font-bold text-white">{session.user?.name || "gatoCanNaturaRural"}</p>
              <p className="text-slate-200">{session.user?.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/" className="rounded-md border border-white/20 bg-black/40 px-4 py-2 font-semibold text-white transition hover:bg-white/10">
              Volver al inicio
            </Link>
            <button
              type="button"
              className="rounded-md border border-white/20 bg-black/40 px-4 py-2 font-semibold text-white transition hover:bg-white/10"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Cerrar sesión
            </button>
          </div>
        </section>

        <section className={glassCard}>
          <h2 className="mb-4 text-2xl font-bold text-white">Actividad solidaria</h2>
          <div className="grid gap-2 text-slate-100">
            <p>
              <span className="font-semibold">Total donaciones:</span> <strong>{profile.totalDonaciones} €</strong>
            </p>
            <p>
              <span className="font-semibold">Karma Rank:</span> <strong>{profile.karmaPoints}</strong>
            </p>
            <p>
              <span className="font-semibold">Mejor puntuación Gatito Runner:</span> <strong>{profile.runnerBestScore}</strong>
            </p>
            <p>
              <span className="font-semibold">Mejor distancia Gatito Runner:</span> <strong>{profile.runnerBestDistanceM} m</strong>
            </p>
          </div>
        </section>

        <section className={`${glassCard} grid gap-5`}>
          <h2 className="text-2xl font-bold text-white">Datos personales</h2>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-300">Nombre completo</span>
            <input className={inputClass} disabled={!editing} value={profile.nombreCompleto} onChange={(e) => updateField("nombreCompleto", e.target.value)} placeholder="Nombre completo" />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-300">Email</span>
            <input className={inputClass} value={session.user?.email || ""} disabled placeholder="Email" />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-300">DNI</span>
            <input className={inputClass} disabled={!editing} value={profile.dniNie} onChange={(e) => updateField("dniNie", e.target.value)} placeholder="DNI" />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-300">Dirección</span>
            <input className={inputClass} disabled={!editing} value={profile.direccion} onChange={(e) => updateField("direccion", e.target.value)} placeholder="Dirección" />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-300">Teléfono</span>
            <input className={inputClass} disabled={!editing} value={profile.telefono} onChange={(e) => updateField("telefono", e.target.value)} placeholder="Teléfono" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-300">Código postal</span>
              <input className={inputClass} disabled={!editing} value={profile.codigoPostal} onChange={(e) => updateField("codigoPostal", e.target.value)} placeholder="Código postal" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-300">Población</span>
              <input className={inputClass} disabled={!editing} value={profile.poblacion} onChange={(e) => updateField("poblacion", e.target.value)} placeholder="Población" />
            </label>
          </div>

          <label className="flex items-center gap-3 text-slate-300">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/20 bg-black/40 text-blue-500 focus:ring-2 focus:ring-blue-500"
              checked={profile.aceptaPoliticas}
              disabled={!editing}
              onChange={(e) => setProfile((prev) => ({ ...prev, aceptaPoliticas: e.target.checked }))}
            />
            Acepto las políticas de seguridad y privacidad.
          </label>

          <div className="flex flex-wrap gap-3">
            {!editing ? (
              <button
                type="button"
                className="rounded-md border border-white/20 bg-black/40 px-4 py-2 font-semibold text-white transition hover:bg-white/10"
                onClick={() => setEditing(true)}
              >
                Modificar
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="rounded-md border border-blue-400/40 bg-blue-500/20 px-4 py-2 font-semibold text-white transition hover:bg-blue-500/30"
                  onClick={saveProfile}
                >
                  Guardar
                </button>
                <button
                  type="button"
                  className="rounded-md border border-white/20 bg-black/40 px-4 py-2 font-semibold text-white transition hover:bg-white/10"
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </section>

        {errorMessage && <p className="font-semibold text-red-400">{errorMessage}</p>}
        {message && <p className="font-semibold text-emerald-400">{message}</p>}
      </div>
    </main>
  );
}
