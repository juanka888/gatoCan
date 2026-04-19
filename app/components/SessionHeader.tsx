"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useMemo, useState } from "react";

export default function SessionHeader() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const avatar = useMemo(() => {
    if (session?.user?.image) return session.user.image;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.user?.name || "G")}&background=0f4c5c&color=fff`;
  }, [session]);

  return (
    <div style={{ position: "absolute", right: "20px", top: "30px", zIndex: 1100 }}>
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
              <p style={{ margin: "5px 10px", fontSize: "12px", color: "#666", fontWeight: "bold" }}>Hola, {session.user.name}</p>
              
              <Link href="/perfil" onClick={() => setOpen(false)} style={{ display: "block", padding: "10px", color: "#333", textDecoration: "none", fontSize: "14px" }}>👤 Mi Perfil</Link>
              
              {/* RESTAURADO: Lógica de Panel de Control para Admin/Moderador */}
              {(session.user as any).role === "ADMIN" || (session.user as any).role === "MODERATOR" ? (
                <Link href="/admin" onClick={() => setOpen(false)} style={{ display: "block", padding: "10px", color: "#0f4c5c", textDecoration: "none", fontSize: "14px", fontWeight: "bold", borderTop: "1px solid #eee" }}>
                  🛠️ Panel de Control
                </Link>
              ) : null}

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
