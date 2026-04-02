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
    return <main className="mx-auto grid max-w-[900px] gap-4 p-6 text-slate-900">Cargando perfil...</main>;
  }

  if (status !== "authenticated") {
    return (
      <main className="mx-auto grid max-w-[900px] gap-4 p-6 text-slate-900">
        <h1 className="text-slate-900 text-3xl font-bold">Mi perfil</h1>
        <p>Necesitas iniciar sesión para ver y editar tu perfil.</p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
            onClick={() => signIn("google", { callbackUrl: "/perfil" })}
          >
            Acceder con Google
          </button>
          <Link
            href="/"
            className="rounded-xl bg-slate-800 px-4 py-2 font-semibold text-white transition hover:bg-slate-900"
          >
            Volver al Inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-[900px] gap-4 p-6 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-slate-900 text-3xl font-bold">Mi perfil</h1>
        <Link
          href="/"
          className="rounded-xl bg-slate-800 px-4 py-2 font-semibold text-white transition hover:bg-slate-900"
        >
          Volver al Inicio
        </Link>
      </div>

      <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-2xl shadow-black/20 flex items-center gap-4">
        <img src={avatar} alt="Avatar" className="h-[70px] w-[70px] rounded-full border-2 border-slate-300" />
        <div className="text-slate-900">
          <strong>{session.user?.name || "Usuario"}</strong>
          <div>{session.user?.email}</div>
        </div>
      </div>

      <section className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-2xl shadow-black/20 text-slate-900">
        <h3 className="text-slate-900 font-bold mb-3">Actividad solidaria</h3>
        <p>
          Total donaciones: <strong>{profile.totalDonaciones} €</strong>
        </p>
        <p>
          Zarpa Karma: <strong>{profile.karmaPoints}</strong>
        </p>
        <p>
          Mejor puntuación Gatito Runner: <strong>{profile.runnerBestScore}</strong>
        </p>
        <p>
          Mejor distancia Gatito Runner: <strong>{profile.runnerBestDistanceM} m</strong>
        </p>
      </section>

      <section className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-2xl shadow-black/20 text-slate-900">
        <h3 className="text-slate-900 font-bold mb-3">Datos personales</h3>

        <div className="flex flex-col gap-4">
          <input
            className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-slate-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={!editing}
            value={profile.nombreCompleto}
            onChange={(e) => updateField("nombreCompleto", e.target.value)}
            placeholder="Nombre completo"
          />
          <input
            className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-slate-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:text-slate-500"
            value={session.user?.email || ""}
            disabled
            placeholder="Email"
          />
          <input
            className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-slate-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={!editing}
            value={profile.dniNie}
            onChange={(e) => updateField("dniNie", e.target.value)}
            placeholder="DNI"
          />
          <input
            className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-slate-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={!editing}
            value={profile.direccion}
            onChange={(e) => updateField("direccion", e.target.value)}
            placeholder="Dirección"
          />
          <input
            className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-slate-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={!editing}
            value={profile.telefono}
            onChange={(e) => updateField("telefono", e.target.value)}
            placeholder="Teléfono"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-slate-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={!editing}
              value={profile.codigoPostal}
              onChange={(e) => updateField("codigoPostal", e.target.value)}
              placeholder="Código postal"
            />
            <input
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-slate-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={!editing}
              value={profile.poblacion}
              onChange={(e) => updateField("poblacion", e.target.value)}
              placeholder="Población"
            />
          </div>

          <label className="flex items-center gap-2 text-slate-900">
            <input
              type="checkbox"
              checked={profile.aceptaPoliticas}
              disabled={!editing}
              onChange={(e) => setProfile((prev) => ({ ...prev, aceptaPoliticas: e.target.checked }))}
            />
            Acepto las políticas de seguridad y privacidad.
          </label>

          <div className="flex flex-wrap gap-2">
            {!editing ? (
              <button
                type="button"
                className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
                onClick={() => setEditing(true)}
              >
                Modificar
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700"
                  onClick={saveProfile}
                >
                  Guardar
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-slate-500 px-4 py-2 font-semibold text-white transition hover:bg-slate-600"
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </button>
              </>
            )}
            <button
              type="button"
              className="rounded-xl bg-rose-600 px-4 py-2 font-semibold text-white transition hover:bg-rose-700"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </section>

      {errorMessage && <p className="font-semibold text-red-700">{errorMessage}</p>}
      {message && <p className="font-semibold text-green-700">{message}</p>}
    </main>
  );
}
