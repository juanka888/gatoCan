"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

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

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const avatar = useMemo(
    () =>
      session?.user?.image ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.user?.name || "GatoCan")}&background=0f4c5c&color=fff`,
    [session?.user?.image, session?.user?.name],
  );

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
    return <main className="mx-auto grid max-w-[900px] gap-4 p-6 !text-white"><p className="!text-white">Cargando perfil...</p></main>;
  }

  if (status !== "authenticated") {
    return (
      <main className="mx-auto grid max-w-[900px] gap-4 p-6 !text-white">
        <h1 className="!text-white text-3xl font-bold">Mi perfil</h1>
        <p className="!text-white">Necesitas iniciar sesión para ver y editar tu perfil.</p>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 font-semibold !text-white" type="button" onClick={() => signIn("google", { callbackUrl: "/perfil" })}>Acceder con Google</button>
          <Link
            href="/"
            className="rounded-lg bg-blue-700 px-4 py-2 font-semibold no-underline !text-white"
          >
            Volver al Inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-[900px] gap-4 p-6 !text-white">
      <div className="bg-black/80 backdrop-blur-lg border border-white/20 rounded-xl p-6 !text-white flex flex-wrap items-center justify-between gap-3">
        <h1 className="!text-white text-3xl font-bold">Mi perfil</h1>
        <Link
          href="/"
          className="rounded-lg bg-blue-700 px-4 py-2 font-semibold no-underline !text-white"
        >
          Volver al Inicio
        </Link>
      </div>

      <div className="bg-black/80 backdrop-blur-lg border border-white/20 rounded-xl p-6 !text-white flex items-center gap-3">
        <img src={avatar} alt="Avatar" className="h-[70px] w-[70px] rounded-full border-2 border-slate-300" />
        <div>
          <strong className="!text-white">{session.user?.name || "Usuario"}</strong>
          <div className="!text-white">{session.user?.email}</div>
        </div>
      </div>

      <section className="bg-black/80 backdrop-blur-lg border border-white/20 rounded-xl p-6 !text-white">
        <h3 className="!text-white mt-0 text-xl font-semibold">Actividad solidaria</h3>
        <p className="!text-white">Total donaciones: <strong className="!text-white">{profile.totalDonaciones} €</strong></p>
        <p className="!text-white">Zarpa Karma: <strong className="!text-white">{profile.karmaPoints}</strong></p>
        <p className="!text-white">Mejor puntuación Gatito Runner: <strong className="!text-white">{profile.runnerBestScore}</strong></p>
        <p className="!text-white">Mejor distancia Gatito Runner: <strong className="!text-white">{profile.runnerBestDistanceM} m</strong></p>
      </section>

      <section className="bg-black/80 backdrop-blur-lg border border-white/20 rounded-xl p-6 !text-white grid gap-3">
        <h3 className="!text-white mt-0 text-xl font-semibold">Datos personales</h3>

        <input className="w-full bg-white/10 border border-white/20 rounded-lg p-2 !text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60" disabled={!editing} value={profile.nombreCompleto} onChange={(e) => updateField("nombreCompleto", e.target.value)} placeholder="Nombre completo" />
        <input className="w-full bg-white/10 border border-white/20 rounded-lg p-2 !text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60" value={session.user?.email || ""} disabled placeholder="Email" />
        <input className="w-full bg-white/10 border border-white/20 rounded-lg p-2 !text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60" disabled={!editing} value={profile.dniNie} onChange={(e) => updateField("dniNie", e.target.value)} placeholder="DNI" />
        <input className="w-full bg-white/10 border border-white/20 rounded-lg p-2 !text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60" disabled={!editing} value={profile.direccion} onChange={(e) => updateField("direccion", e.target.value)} placeholder="Dirección" />
        <input className="w-full bg-white/10 border border-white/20 rounded-lg p-2 !text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60" disabled={!editing} value={profile.telefono} onChange={(e) => updateField("telefono", e.target.value)} placeholder="Teléfono" />

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input className="w-full bg-white/10 border border-white/20 rounded-lg p-2 !text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60" disabled={!editing} value={profile.codigoPostal} onChange={(e) => updateField("codigoPostal", e.target.value)} placeholder="Código postal" />
          <input className="w-full bg-white/10 border border-white/20 rounded-lg p-2 !text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60" disabled={!editing} value={profile.poblacion} onChange={(e) => updateField("poblacion", e.target.value)} placeholder="Población" />
        </div>

        <label className="!text-white flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-white/20 bg-white/10"
            checked={profile.aceptaPoliticas}
            disabled={!editing}
            onChange={(e) => setProfile((prev) => ({ ...prev, aceptaPoliticas: e.target.checked }))}
          />
          <span className="!text-white">Acepto las políticas de seguridad y privacidad.</span>
        </label>

        <div className="flex flex-wrap gap-2">
          {!editing ? (
            <button className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 font-semibold !text-white" type="button" onClick={() => setEditing(true)}>Modificar</button>
          ) : (
            <>
              <button className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 font-semibold !text-white" type="button" onClick={saveProfile}>Guardar</button>
              <button className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 font-semibold !text-white" type="button" onClick={() => setEditing(false)}>Cancelar</button>
            </>
          )}
          <button className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 font-semibold !text-white" type="button" onClick={() => signOut({ callbackUrl: "/" })}>Cerrar sesión</button>
        </div>
      </section>

      {errorMessage && <p className="!text-white font-semibold">{errorMessage}</p>}
      {message && <p className="!text-white font-semibold">{message}</p>}
    </main>
  );
}
