"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { type CSSProperties, useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";

// 1. Añadimos esta línea para que Vercel no intente pre-renderizar estáticamente
export const dynamic = 'force-dynamic';

// --- TIPOS ---
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

// --- ESTILOS DE CRISTAL ---
const glassCard: CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  borderRadius: '24px',
  padding: '1.5rem',
  color: '#FFFFFF',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
};

const inputStyle: CSSProperties = {
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: 12,
  padding: "0.75rem 1rem",
  backgroundColor: "rgba(255, 255, 255, 0.08)",
  color: "#FFFFFF",
  fontSize: "1rem",
  outline: "none",
  width: "100%",
};

const btnPrimary: CSSProperties = {
  background: "rgba(255, 255, 255, 0.2)",
  color: "#fff",
  borderRadius: 12,
  padding: "0.6rem 1.2rem",
  fontWeight: 600,
  border: "1px solid rgba(255, 255, 255, 0.3)",
  cursor: "pointer",
  backdropFilter: "blur(10px)",
  textDecoration: "none", // Añadido para los links
  display: "inline-block"
};

// --- LÓGICA DNI ---
const dniLetters = "TRWAGMYFPDXBNJZSQVHLCKE";
function normalizeDni(v: string) { return v.replace(/\s|-/g, "").toUpperCase(); }
function isValidDni(v: string) {
  const dni = normalizeDni(v);
  if (!/^\d{8}[A-Z]$/.test(dni)) return false;
  return dni[8] === dniLetters[Number(dni.slice(0, 8)) % 23];
}

// --- SUBCOMPONENTE CON LA LÓGICA ---
function PerfilContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const avatar = useMemo(() => 
    session?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.user?.name || "G")}&background=0f4c5c&color=fff`,
    [session]
  );

  useEffect(() => {
    if (searchParams?.get("success") === "true") {
      setShowSuccessBanner(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFFFFF', '#2ecc71']
      });
      const timer = setTimeout(() => setShowSuccessBanner(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadProfile = async () => {
      if (status !== "authenticated") { 
        if (status === "unauthenticated") setLoading(false);
        return; 
      }
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
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
        }
      } catch (err) {
        console.error("Error cargando perfil:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [session, status]);

  const updateField = (f: keyof ProfileData, v: string) => {
    setProfile(p => ({ ...p, [f]: v }));
    if (f === "dniNie" && normalizeDni(v).length > 0 && !isValidDni(v)) {
      setErrorMessage("DNI no válido");
    } else { setErrorMessage(""); }
  };

  const saveProfile = async () => {
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (response.ok) {
      setEditing(false);
      setMessage("Perfil actualizado.");
      setTimeout(() => setMessage(""), 4000);
    }
  };

  if (loading) return <main style={{ padding: "2rem", color: "white" }}>Cargando perfil...</main>;
  if (status === "unauthenticated") return <main style={{ padding: "2rem", color: "white" }}>Por favor, inicia sesión.</main>;

  return (
    <main style={{ maxWidth: 850, margin: "0 auto", padding: "2rem", display: "grid", gap: 20 }}>
      {showSuccessBanner && (
        <div style={{ ...glassCard, backgroundColor: 'rgba(46, 204, 113, 0.25)', border: '1px solid #2ecc71', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#2ecc71' }}>¡Gracias por tu donación! 🐾</h2>
          <p style={{ margin: 0 }}>Tu apoyo directo a las colonias ha sido procesado.</p>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "white", fontSize: "2.5rem", fontWeight: "bold", textShadow: "2px 2px 10px rgba(0,0,0,0.5)" }}>Mi perfil</h1>
        <Link href="/" style={btnPrimary}>Volver al Inicio</Link>
      </div>

      <div style={glassCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img src={avatar} alt="Avatar" style={{ width: 80, height: 80, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.4)" }} />
          <div>
            <h2 style={{ margin: 0, fontSize: "1.8rem" }}>{profile.nombreCompleto || session?.user?.name}</h2>
            <p style={{ margin: 0, opacity: 0.8 }}>{session?.user?.email}</p>
          </div>
        </div>
      </div>

      <section style={glassCard}>
        <h3 style={{ marginTop: 0, borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: 10 }}>Actividad solidaria</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 15 }}>
          <p>Donaciones: <strong>{profile.totalDonaciones} €</strong></p>
          <p>Zarpa Karma: <strong style={{color: '#FFD700'}}>{profile.karmaPoints} ✨</strong></p>
          <p>Mejor Score: <strong>{profile.runnerBestScore}</strong></p>
          <p>Distancia: <strong>{profile.runnerBestDistanceM} m</strong></p>
        </div>
      </section>

      <section style={{ ...glassCard, display: "grid", gap: 15 }}>
        <h3 style={{ marginTop: 0, borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: 10 }}>Datos personales</h3>
        <div style={{ display: "grid", gap: 10 }}>
           <label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Nombre completo</label>
           <input style={inputStyle} disabled={!editing} value={profile.nombreCompleto} onChange={(e) => updateField("nombreCompleto", e.target.value)} />
           <label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>DNI / NIE</label>
           <input style={inputStyle} disabled={!editing} value={profile.dniNie} onChange={(e) => updateField("dniNie", e.target.value)} />
           <label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Dirección</label>
           <input style={inputStyle} disabled={!editing} value={profile.direccion} onChange={(e) => updateField("direccion", e.target.value)} />
           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
             <div>
                <label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>C.P.</label>
                <input style={inputStyle} disabled={!editing} value={profile.codigoPostal} onChange={(e) => updateField("codigoPostal", e.target.value)} />
             </div>
             <div>
                <label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Población</label>
                <input style={inputStyle} disabled={!editing} value={profile.poblacion} onChange={(e) => updateField("poblacion", e.target.value)} />
             </div>
           </div>
        </div>

        <label style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer", marginTop: 10 }}>
          <input type="checkbox" checked={profile.aceptaPoliticas} disabled={!editing} onChange={(e) => setProfile(p => ({ ...p, aceptaPoliticas: e.target.checked }))} style={{ width: 18, height: 18 }} />
          Acepto las políticas de seguridad y privacidad.
        </label>

        <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
          {!editing ? (
            <button style={{ ...btnPrimary, background: "#f5a623", border: "none" }} onClick={() => setEditing(true)}>Modificar datos</button>
          ) : (
            <>
              <button style={{ ...btnPrimary, background: "#166534", border: "none" }} onClick={saveProfile}>Guardar Cambios</button>
              <button style={{ ...btnPrimary, background: "rgba(255,0,0,0.3)", border: "none" }} onClick={() => setEditing(false)}>Cancelar</button>
            </>
          )}
          <button style={{ ...btnPrimary, background: "rgba(255,255,255,0.1)" }} onClick={() => signOut({ callbackUrl: "/" })}>Cerrar sesión</button>
        </div>
      </section>

      {errorMessage && <div style={{ ...glassCard, backgroundColor: 'rgba(220, 38, 38, 0.2)', padding: '10px', textAlign: 'center' }}>{errorMessage}</div>}
      {message && <div style={{ ...glassCard, backgroundColor: 'rgba(22, 101, 52, 0.2)', padding: '10px', textAlign: 'center' }}>{message}</div>}
    </main>
  );
}

// --- COMPONENTE PRINCIPAL QUE EXPORTA NEXT.JS ---
export default function PerfilPage() {
  return (
    <Suspense fallback={<main style={{ padding: "2rem", color: "white" }}>Cargando página...</main>}>
      <PerfilContent />
    </Suspense>
  );
}