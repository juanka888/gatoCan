"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { type CSSProperties, useEffect, useMemo, useState } from "react";

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

const inputStyle: CSSProperties = {
  border: "1px solid rgba(148, 163, 184, 0.45)",
  borderRadius: 8,
  padding: "0.65rem 0.8rem",
  backgroundColor: "rgba(15, 23, 42, 0.55)",
  color: "#f8fafc",
  fontSize: "0.95rem",
  outline: "none",
};

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
    return <main className="text-white" style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem" }}>Cargando perfil...</main>;
  }

  if (status !== "authenticated") {
    return (
      <main className="text-white" style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem", display: "grid", gap: 12 }}>
        <h1 className="text-white">Mi perfil</h1>
        <p>Necesitas iniciar sesión para ver y editar tu perfil.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" onClick={() => signIn("google", { callbackUrl: "/perfil" })}>Acceder con Google</button>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              background: "#1d4ed8",
              color: "#fff",
              borderRadius: 8,
              padding: "0.55rem 0.85rem",
              fontWeight: 600,
            }}
          >
            Volver al Inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="text-white" style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem", display: "grid", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <h1 className="text-white" style={{ margin: 0 }}>Mi perfil</h1>
        <Link
          href="/"
          style={{
            textDecoration: "none",
            background: "#1d4ed8",
            color: "#fff",
            borderRadius: 8,
            padding: "0.55rem 0.85rem",
            fontWeight: 600,
          }}
        >
          Volver al Inicio
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img src={avatar} alt="Avatar" style={{ width: 70, height: 70, borderRadius: "50%", border: "2px solid #cbd5e1" }} />
        <div>
          <strong>{session.user?.name || "Usuario"}</strong>
          <div>{session.user?.email}</div>
        </div>
      </div>

      <section className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white" style={{ border: "1px solid rgba(148, 163, 184, 0.45)", borderRadius: 10, padding: 14 }}>
        <h3 className="text-white" style={{ marginTop: 0 }}>Actividad solidaria</h3>
        <p>Total donaciones: <strong>{profile.totalDonaciones} €</strong></p>
        <p>Zarpa Karma: <strong>{profile.karmaPoints}</strong></p>
        <p>Mejor puntuación Gatito Runner: <strong>{profile.runnerBestScore}</strong></p>
        <p>Mejor distancia Gatito Runner: <strong>{profile.runnerBestDistanceM} m</strong></p>
      </section>

      <section className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white" style={{ border: "1px solid rgba(148, 163, 184, 0.45)", borderRadius: 10, padding: 14, display: "grid", gap: 10 }}>
        <h3 className="text-white" style={{ marginTop: 0 }}>Datos personales</h3>

        <input className="!bg-black/40 !text-white placeholder:text-slate-400" style={inputStyle} disabled={!editing} value={profile.nombreCompleto} onChange={(e) => updateField("nombreCompleto", e.target.value)} placeholder="Nombre completo" />
        <input className="!bg-black/40 !text-white placeholder:text-slate-400" style={{ ...inputStyle, backgroundColor: "rgba(30, 41, 59, 0.75)", color: "#cbd5e1" }} value={session.user?.email || ""} disabled placeholder="Email" />
        <input className="!bg-black/40 !text-white placeholder:text-slate-400" style={inputStyle} disabled={!editing} value={profile.dniNie} onChange={(e) => updateField("dniNie", e.target.value)} placeholder="DNI" />
        <input className="!bg-black/40 !text-white placeholder:text-slate-400" style={inputStyle} disabled={!editing} value={profile.direccion} onChange={(e) => updateField("direccion", e.target.value)} placeholder="Dirección" />
        <input className="!bg-black/40 !text-white placeholder:text-slate-400" style={inputStyle} disabled={!editing} value={profile.telefono} onChange={(e) => updateField("telefono", e.target.value)} placeholder="Teléfono" />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input className="!bg-black/40 !text-white placeholder:text-slate-400" style={inputStyle} disabled={!editing} value={profile.codigoPostal} onChange={(e) => updateField("codigoPostal", e.target.value)} placeholder="Código postal" />
          <input className="!bg-black/40 !text-white placeholder:text-slate-400" style={inputStyle} disabled={!editing} value={profile.poblacion} onChange={(e) => updateField("poblacion", e.target.value)} placeholder="Población" />
        </div>

        <label className="text-white" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={profile.aceptaPoliticas}
            disabled={!editing}
            onChange={(e) => setProfile((prev) => ({ ...prev, aceptaPoliticas: e.target.checked }))}
          />
          Acepto las políticas de seguridad y privacidad.
        </label>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {!editing ? (
            <button type="button" onClick={() => setEditing(true)}>Modificar</button>
          ) : (
            <>
              <button type="button" onClick={saveProfile}>Guardar</button>
              <button type="button" onClick={() => setEditing(false)}>Cancelar</button>
            </>
          )}
          <button type="button" onClick={() => signOut({ callbackUrl: "/" })}>Cerrar sesión</button>
        </div>
      </section>

      {errorMessage && <p style={{ color: "#dc2626", fontWeight: 600 }}>{errorMessage}</p>}
      {message && <p style={{ color: "#166534", fontWeight: 600 }}>{message}</p>}
    </main>
  );
}
