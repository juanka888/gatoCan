"use client";

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

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

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
        setMessage("No se pudo cargar tu perfil.");
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
  };

  const saveProfile = async () => {
    setMessage("");
    if (!profile.aceptaPoliticas) {
      setMessage("Debes aceptar las políticas para guardar tu perfil.");
      return;
    }

    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombreCompleto: profile.nombreCompleto,
        telefono: profile.telefono,
        dniNie: profile.dniNie,
        direccion: profile.direccion,
        codigoPostal: profile.codigoPostal,
        poblacion: profile.poblacion,
        aceptaPoliticas: profile.aceptaPoliticas,
      }),
    });

    if (!response.ok) {
      setMessage("No se pudo guardar el perfil.");
      return;
    }

    setEditing(false);
    setMessage("Perfil actualizado correctamente.");
  };

  if (status === "loading" || loading) {
    return <main style={{ maxWidth: 900, margin: "0 auto", padding: "1rem" }}>Cargando perfil...</main>;
  }

  if (status !== "authenticated") {
    return (
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "1rem", display: "grid", gap: 12 }}>
        <h1>Mi perfil</h1>
        <p>Necesitas iniciar sesión para ver y editar tu perfil.</p>
        <button type="button" onClick={() => signIn("google", { callbackUrl: "/perfil" })}>
          Acceder con Google
        </button>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "1rem", display: "grid", gap: 12 }}>
      <h1>Mi perfil</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img src={avatar} alt="Avatar" style={{ width: 70, height: 70, borderRadius: "50%" }} />
        <div>
          <strong>{session.user?.name || "Usuario"}</strong>
          <div>{session.user?.email}</div>
        </div>
      </div>

      <section style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
        <h3>Actividad solidaria</h3>
        <p>Total donaciones: <strong>{profile.totalDonaciones} €</strong></p>
        <p>Zarpa Karma: <strong>{profile.karmaPoints}</strong></p>
        <p>Mejor puntuación Gatito Runner: <strong>{profile.runnerBestScore}</strong></p>
        <p>Mejor distancia Gatito Runner: <strong>{profile.runnerBestDistanceM} m</strong></p>
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12, display: "grid", gap: 8 }}>
        <h3>Datos personales</h3>

        <input disabled={!editing} value={profile.nombreCompleto} onChange={(e) => updateField("nombreCompleto", e.target.value)} placeholder="Nombre completo" />
        <input value={session.user?.email || ""} disabled placeholder="Email" />
        <input disabled={!editing} value={profile.telefono} onChange={(e) => updateField("telefono", e.target.value)} placeholder="Teléfono" />
        <input disabled={!editing} value={profile.dniNie} onChange={(e) => updateField("dniNie", e.target.value)} placeholder="DNI/NIE" />
        <input disabled={!editing} value={profile.direccion} onChange={(e) => updateField("direccion", e.target.value)} placeholder="Dirección" />
        <input disabled={!editing} value={profile.codigoPostal} onChange={(e) => updateField("codigoPostal", e.target.value)} placeholder="Código postal" />
        <input disabled={!editing} value={profile.poblacion} onChange={(e) => updateField("poblacion", e.target.value)} placeholder="Población" />
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
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

      {message && <p>{message}</p>}
    </main>
  );
}
