"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useMemo, useState } from "react";

// Esto evita el error de Vercel al reconocer el rol del usuario
interface CustomUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export default function SessionHeader() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const user = session?.user as CustomUser;

  const avatar = useMemo(() => {
    if (user?.image) return user.image;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "G")}&background=0f4c5c&color=fff`;
  }, [user]);

  return (
    <div style={{ position: "absolute", right: "20px", top: "25px", zIndex: 1100 }}>
      {status === "authenticated" ? (
        <div style={{ position: "relative" }}>
          <img
            src={avatar}
            alt="User"
            onClick={() => setOpen(!open)}
            style={{ width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer", border: "2px solid #fff", objectFit: "cover" }}
          />
          {open && (
            <div style={{ position: "absolute", right: 0, top: "50px", background: "#fff", borderRadius: "8px", padding: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", minWidth: "180px" }}>
              <p style={{ margin: "5px 10px", fontSize: "12px", color: "#666", fontWeight: "bold" }}>Hola, {user.name}</p>
              
              <Link href="/perfil" onClick={() => setOpen(false)} style={{ display: "block", padding: "10px", color: "#333", textDecoration: "none", fontSize: "14px" }}>👤 Mi Perfil</Link>
              
              {/* RESTAURADO: Acceso al Panel de Control */}
              {(user.role === "ADMIN" || user.role === "MODERATOR") && (
                <Link href="/admin" onClick={() => setOpen(false)} style={{ display: "block", padding: "10px", color: "#0f4c5c", textDecoration: "none", fontSize: "14px", fontWeight: "bold", borderTop: "1px solid #eee" }}>
                  🛠️ Panel de Control
                </Link>
              )}

              <button onClick={() => signOut()} style={{ width: "100%", textAlign: "left", padding: "10px", border: "none", background: "none", color: "red", cursor: "pointer", fontSize: "14px", borderTop: "1px solid #eee" }}>
                🚪 Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/login" style={{ padding: "8px 18px", fontSize: "0.8rem", borderRadius: "20px", border: "2px solid #fff", backgroundColor: "rgba(255,255,255,0.1)", color: "#fff", textDecoration: "none", fontWeight: "bold", display: "inline-block" }}>
          Acceder / Registro
        </Link>
      )}
    </div>
  );
              }
