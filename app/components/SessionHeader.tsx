"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { isAdmin } from "@/lib/admin";

const fallbackAvatar = "/img/default-avatar.svg";

export default function SessionHeader() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const showHomeButton = pathname !== "/";
  const admin = isAdmin(session?.user?.email);

  const avatar = useMemo(() => {
    if (session?.user?.image) return session.user.image;
    const initial = session?.user?.name?.trim()?.charAt(0)?.toUpperCase();
    return initial 
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || "G")}&background=0f4c5c&color=fff`
      : fallbackAvatar;
  }, [session?.user?.image, session?.user?.name]);

  return (
    <div className="session-header" style={{ position: "absolute", right: "15px", top: "15px", zIndex: 1000, display: "flex", gap: "10px", alignItems: "center" }}>
      {showHomeButton && (
        <Link href="/" className="home-link" style={{ fontSize: "0.8rem", color: "#fff", textDecoration: "none", background: "rgba(0,0,0,0.3)", padding: "5px 10px", borderRadius: "20px" }}>
          ⌂ Inicio
        </Link>
      )}

      {status !== "authenticated" ? (
        <Link href="/login" className="session-btn" style={{ padding: "8px 15px", borderRadius: "20px", background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: "0.85rem", border: "1px solid rgba(255,255,255,0.4)", textDecoration: "none" }}>
          Acceder / Registro
        </Link>
      ) : (
        <div style={{ position: "relative" }}>
          <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            <img src={avatar} alt="Avatar" style={{ width: 42, height: 42, borderRadius: "50%", border: "2px solid #fff", objectFit: "cover" }} />
          </button>
          {open && (
            <div style={{ position: "absolute", right: 0, top: "50px", minWidth: 180, background: "white", borderRadius: "12px", padding: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", display: "grid", gap: "5px" }}>
              <Link href="/perfil" onClick={() => setOpen(false)} style={{ padding: "10px", color: "#333", textDecoration: "none", fontSize: "14px" }}>Mi perfil</Link>
              {admin && <Link href="/admin" onClick={() => setOpen(false)} style={{ padding: "10px", color: "#facc15", fontWeight: "bold", textDecoration: "none", fontSize: "14px" }}>🛠️ Admin</Link>}
              <button onClick={() => signOut({ callbackUrl: "/" })} style={{ padding: "10px", textAlign: "left", background: "none", border: "none", color: "red", cursor: "pointer", fontSize: "14px", borderTop: "1px solid #eee" }}>Cerrar sesión</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
