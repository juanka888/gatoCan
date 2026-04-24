"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { z } from "zod";

// --- ESQUEMA DE SEGURIDAD CON ZOD ---
const profileSchema = z.object({
  nombreCompleto: z.string().min(3, "El nombre es demasiado corto").max(100),
  telefono: z.string().regex(/^[0-9+ ]*$/, "Teléfono no válido").optional().or(z.literal("")),
  dniNie: z.string().refine((v) => v === "" || isValidDni(v), {
    message: "DNI/NIE no es válido",
  }),
  direccion: z.string().max(200).optional().or(z.literal("")),
  codigoPostal: z.string().refine((v) => v === "" || /^\d{5}$/.test(v), {
    message: "El C.P. debe tener 5 dígitos",
  }),
  poblacion: z.string().max(100).optional().or(z.literal("")),
  aceptaPoliticas: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar las políticas para guardar",
  }),
});

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

// --- VALIDACIÓN DE DNI ---
const dniLetters = "TRWAGMYFPDXBNJZSQVHLCKE";
function normalizeDni(v: string) { return v.replace(/\s|-/g, "").toUpperCase(); }
function isValidDni(v: string) {
  const dni = normalizeDni(v);
  if (!/^\d{8}[A-Z]$/.test(dni)) return false;
  return dni[8] === dniLetters[Number(dni.slice(0, 8)) % 23];
}

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [manualConcepto, setManualConcepto] = useState("");
  const [manualCantidad, setManualCantidad] = useState("");
  const [manualMessage, setManualMessage] = useState("");

  const avatar = useMemo(() => 
    session?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.user?.name || "G")}&background=0f4c5c&color=fff`,
    [session]
  );

  useEffect(() => {
    const loadProfile = async () => {
      if (status !== "authenticated") { setLoading(false); return; }
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          const p = data.profile || {};
          setProfile(prev => ({
            ...prev,
            ...p,
            nombreCompleto: p.nombreCompleto || session?.user?.name || "",
          }));
        }
      } catch (e) { console.error("Error cargando perfil", e); }
      setLoading(false);
    };
    loadProfile();
  }, [session, status]);

  // --- HANDLERS ---
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " ") e.stopPropagation();
  };

  const updateField = (f: keyof ProfileData, v: any) => {
    setProfile(p => ({ ...p, [f]: v }));
    setErrorMessage(""); 
  };

  const saveProfile = async () => {
    setErrorMessage("");
    setMessage("");

    // 1. VALIDACIÓN ZOD CORREGIDA PARA TYPESCRIPT
    const validation = profileSchema.safeParse(profile);
    
    if (!validation.success) {
      const formattedErrors = validation.error.flatten();
      const fieldErrors = Object.values(formattedErrors.fieldErrors);
      const firstError = fieldErrors.length > 0 && fieldErrors[0] ? fieldErrors[0][0] : "Datos inválidos";
      
      setErrorMessage(firstError);
      return;
    }

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (response.ok) {
        setEditing(false);
        setMessage("✅ Perfil actualizado correctamente.");
      } else {
        setErrorMessage("Error al guardar en el servidor.");
      }
    } catch (e) {
      setErrorMessage("Error de conexión.");
    }
  };

  const submitManualDonationValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualConcepto.trim() || !manualCantidad) {
      setManualMessage("Completa el concepto y el importe para enviar la validación.");
      return;
    }

    try {
      const response = await fetch("/api/manual-donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concepto: manualConcepto,
          cantidad: Number(manualCantidad),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setManualMessage(body.error || "No se pudo enviar la validación manual.");
        return;
      }

      setManualMessage("Solicitud enviada. Revisaremos el ingreso y actualizaremos tus puntos Karma.");
      setManualConcepto("");
      setManualCantidad("");
    } catch (error) {
      setManualMessage("No se pudo enviar la validación manual.");
    }
  };

  if (loading) return <main style={{ padding: "2rem", color: "white", textAlign: "center" }}>Cargando perfil...</main>;

  return (
    <main style={{ maxWidth: 850, margin: "0 auto", padding: "clamp(1rem, 4vw, 2rem)", display: "grid", gap: 20 }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ color: "white", fontSize: "clamp(2rem, 8vw, 2.5rem)", fontWeight: "bold", textShadow: "2px 2px 10px rgba(0,0,0,0.5)", margin: 0 }}>Mi perfil</h1>
        <Link href="/" style={btnPrimary}>Volver al Inicio</Link>
      </div>

      {/* INFO SUPERIOR */}
      <div style={glassCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <img src={avatar} alt="Avatar" style={{ width: 80, height: 80, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.4)" }} />
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: "clamp(1.5rem, 5vw, 2.2rem)", overflowWrap: "anywhere" }}>{profile.nombreCompleto}</h2>
            <p style={{ margin: 0, opacity: 0.8 }}>{session?.user?.email}</p>
          </div>
        </div>
      </div>

      {/* ACTIVIDAD */}
      <section style={glassCard}>
        <h3 style={sectionTitle}>Actividad solidaria</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 15 }}>
          <div style={statBox}>Donaciones: <br/><strong>{profile.totalDonaciones} €</strong></div>
          <div style={statBox}>Zarpa Karma: <br/><strong style={{color: '#FFD700'}}>{profile.karmaPoints}</strong></div>
          <div style={statBox}>Mejor Score: <br/><strong>{profile.runnerBestScore}</strong></div>
          <div style={statBox}>Distancia: <br/><strong>{profile.runnerBestDistanceM} m</strong></div>
        </div>
      </section>

      <section style={{ ...glassCard, display: "grid", gap: 14 }}>
        <h3 style={sectionTitle}>Mis Puntos Karma</h3>
        <div style={manualBox}>
          <h4 style={{ margin: 0, fontSize: "1.05rem" }}>Validar Donación Manual</h4>
          <form onSubmit={submitManualDonationValidation} style={{ display: "grid", gap: 12, marginTop: 10 }}>
            <div>
              <label style={labelStyle}>Concepto utilizado en el pago</label>
              <input
                style={inputStyle}
                value={manualConcepto}
                onChange={(e) => setManualConcepto(e.target.value)}
                placeholder="Ej: usuario@email.com o NombreUsuario"
              />
            </div>
            <div>
              <label style={labelStyle}>Importe donado</label>
              <input
                type="number"
                min="1"
                step="0.01"
                style={inputStyle}
                value={manualCantidad}
                onChange={(e) => setManualCantidad(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <button type="submit" style={{ ...btnPrimary, border: "none", width: "fit-content", background: "#2563eb" }}>
              Enviar validación
            </button>
          </form>
          <p style={manualNotice}>
            Una vez enviado, revisaremos la cuenta y tus puntos se sumarán tras confirmar el ingreso
          </p>
          {manualMessage && <div style={successBanner}>{manualMessage}</div>}
        </div>
      </section>

      {/* FORMULARIO */}
      <section style={{ ...glassCard, display: "grid", gap: 15 }}>
        <h3 style={sectionTitle}>Datos personales</h3>

        <div style={{ display: "grid", gap: 15 }}>
          <div>
            <label style={labelStyle}>Nombre completo</label>
            <input 
              style={editing ? inputStyle : disabledInput} 
              disabled={!editing} 
              value={profile.nombreCompleto} 
              onKeyDown={handleKeyDown}
              onChange={(e) => updateField("nombreCompleto", e.target.value)} 
            />
          </div>
          
          <div>
            <label style={labelStyle}>DNI / NIE</label>
            <input 
              style={editing ? inputStyle : disabledInput} 
              disabled={!editing} 
              value={profile.dniNie} 
              onKeyDown={handleKeyDown}
              onChange={(e) => updateField("dniNie", e.target.value)} 
            />
          </div>
          
          <div>
            <label style={labelStyle}>Dirección</label>
            <input 
              style={editing ? inputStyle : disabledInput} 
              disabled={!editing} 
              value={profile.direccion} 
              onKeyDown={handleKeyDown}
              onChange={(e) => updateField("direccion", e.target.value)} 
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
            <div>
               <label style={labelStyle}>C.P.</label>
               <input 
                 style={editing ? inputStyle : disabledInput} 
                 disabled={!editing} 
                 value={profile.codigoPostal} 
                 onKeyDown={handleKeyDown}
                 onChange={(e) => updateField("codigoPostal", e.target.value)} 
               />
            </div>
            <div>
               <label style={labelStyle}>Población</label>
               <input 
                 style={editing ? inputStyle : disabledInput} 
                 disabled={!editing} 
                 value={profile.poblacion} 
                 onKeyDown={handleKeyDown}
                 onChange={(e) => updateField("poblacion", e.target.value)} 
               />
            </div>
          </div>
        </div>

        <label style={{ display: "flex", gap: 10, alignItems: "center", cursor: editing ? "pointer" : "default", marginTop: 10 }}>
          <input 
            type="checkbox" 
            checked={profile.aceptaPoliticas} 
            disabled={!editing} 
            onChange={(e) => updateField("aceptaPoliticas", e.target.checked)} 
            style={{ width: 18, height: 18 }} 
          />
          <span style={{ fontSize: "0.9rem" }}>Acepto las políticas de seguridad y privacidad.</span>
        </label>

        {/* MENSAJES DE ESTADO */}
        {errorMessage && <div style={errorBanner}>{errorMessage}</div>}
        {message && <div style={successBanner}>{message}</div>}

        <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
          {!editing ? (
            <button style={{ ...btnPrimary, background: "#f5a623", border: "none" }} onClick={() => setEditing(true)}>Modificar datos</button>
          ) : (
            <>
              <button style={{ ...btnPrimary, background: "#166534", border: "none" }} onClick={saveProfile}>Guardar Cambios</button>
              <button style={{ ...btnPrimary, background: "rgba(255,255,255,0.2)", border: "none" }} onClick={() => { setEditing(false); setErrorMessage(""); }}>Cancelar</button>
            </>
          )}
          <button style={{ ...btnPrimary, background: "rgba(255,0,0,0.3)", border: "none" }} onClick={() => signOut({ callbackUrl: "/" })}>Cerrar sesión</button>
        </div>
      </section>
    </main>
  );
}

// --- ESTILOS REUTILIZABLES ---
const glassCard: CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  borderRadius: '16px',
  padding: '1.5rem',
  color: '#FFFFFF',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
};

const inputStyle: CSSProperties = {
  border: "1px solid rgba(255, 255, 255, 0.3)",
  borderRadius: 12,
  padding: "0.75rem 1rem",
  backgroundColor: "rgba(0, 0, 0, 0.2)",
  color: "#FFFFFF",
  width: "100%",
  outline: "none"
};

const disabledInput: CSSProperties = {
  ...inputStyle,
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  cursor: "not-allowed",
  opacity: 0.7
};

const btnPrimary: CSSProperties = {
  background: "rgba(255, 255, 255, 0.2)",
  color: "#fff",
  borderRadius: 12,
  padding: "0.6rem 1.2rem",
  fontWeight: 600,
  border: "1px solid rgba(255, 255, 255, 0.3)",
  cursor: "pointer",
  textDecoration: "none",
  textAlign: "center"
};

const sectionTitle: CSSProperties = { marginTop: 0, borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: 10, fontSize: "1.2rem" };
const labelStyle: CSSProperties = { fontWeight: "bold", fontSize: "0.85rem", display: "block", marginBottom: 5, opacity: 0.9 };
const statBox: CSSProperties = { backgroundColor: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "16px", textAlign: "center", backdropFilter: "blur(16px)", boxShadow: "0 6px 20px rgba(0,0,0,0.15)" };
const errorBanner: CSSProperties = { backgroundColor: 'rgba(220, 38, 38, 0.4)', padding: '10px', borderRadius: '10px', textAlign: 'center', fontSize: '0.9rem', color: '#fff', fontWeight: 'bold' };
const successBanner: CSSProperties = { backgroundColor: 'rgba(22, 101, 52, 0.4)', padding: '10px', borderRadius: '10px', textAlign: 'center', fontSize: '0.9rem', color: '#fff', fontWeight: 'bold' };
const manualBox: CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.25)",
  borderRadius: 16,
  padding: "1rem",
  backdropFilter: "blur(16px)",
  boxShadow: "0 6px 24px rgba(15, 23, 42, 0.2)",
};
const manualNotice: CSSProperties = {
  margin: "12px 0 0",
  padding: "0.75rem 0.9rem",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(30, 64, 175, 0.2)",
  color: "#dbeafe",
  fontWeight: 600,
};
