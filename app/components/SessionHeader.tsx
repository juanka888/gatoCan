"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useMemo, useState } from "react";

// Definimos esto para que TS sepa que el usuario tiene ROL
interface CustomUser {
  name?: string | null;
  role?: string; 
  image?: string | null;
}

export default function SessionHeader() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  // Forzamos a TS a entender que el usuario sigue nuestra interfaz
  const user = session?.user as CustomUser;

  const avatar = useMemo(() => {
    if (user?.image) return user.image;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "G")}&background=0f4c5c&color=fff`;
  }, [user]);

  return (
    <div style={{ position: "absolute", right: "10px", top: "10px", zIndex: 1100 }}>
      {status === "authenticated" ? (
        <div style={{ position: "relative" }}>
          <img
            src={avatar}
            alt="User"
            onClick={() => setOpen(!open)}
            style={{ width: "42px", height: "42px", borderRadius: "50%", cursor: "pointer", border: "2px solid #fff", objectFit: "cover" }}
          />
          {open && (
            <div style={{ position: "absolute", right: 0, top: "50px", background: "#fff", borderRadius: "8px", padding: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.2)", minWidth: "190px" }}>
              <p style={{ margin: "0 0 10px 5px", fontSize: "12px", color: "#888" }}>Sesión de {user.name}</p>
              
              <Link href="/perfil" onClick={() => setOpen(false)} style={{ display: "block", padding: "8px", color: "#333", textDecoration: "none", fontSize: "14px" }}>👤 Mi Perfil</Link>
              
              {/* RESTAURADO: Si el rol es ADMIN o MODERATOR aparece el panel */}
              {(user.role === "ADMIN" || user.role === "MODERATOR") && (
                <Link href="/admin" onClick={() => setOpen(false)} style={{ display: "block", padding: "8px", color: "#0f4c5c", textDecoration: "none", fontSize: "14px", fontWeight: "bold", borderTop: "1px solid #eee" }}>
                  🛠️ Panel de Control
                </Link>
              )}

              <button onClick={() => signOut()} style={{ width: "100%", textAlign: "left", padding: "8px", border: "none", background: "none", color: "red", cursor: "pointer", fontSize: "14px", borderTop: "1px solid #eee", marginTop: "5px" }}>
                🚪 Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/login" style={{ padding: "8px 16px", fontSize: "0.85rem", borderRadius: "20px", border: "2px solid #fff", color: "#fff", textDecoration: "none", fontWeight: "bold", backgroundColor: "rgba(255,255,255,0.1)" }}>
          Acceder
        </Link>
      )}
    </div>
  );
}
