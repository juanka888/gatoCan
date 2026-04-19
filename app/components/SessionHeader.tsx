"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { isAdmin } from "@/lib/admin";

export default function SessionHeader() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const showHomeButton = pathname !== "/";
  const admin = isAdmin(session?.user?.email);

  const avatar = useMemo(() => {
    if (session?.user?.image) return session.user.image;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.user?.name || "G")}&background=0f4c5c&color=fff`;
  }, [session]);

  return (
    <div style={{ position: "absolute", right: "20px", top: "20px", zIndex: 1100, display: "flex", gap: "10px", alignItems: "center" }}>
      {showHomeButton && (
        <Link href="/" style={{ color: "#fff", textDecoration: "none", fontSize: "14px", background: "rgba(0,0,0,0.2)", padding: "5px 12px", borderRadius: "20px" }}>
          ⌂ Inicio
        </Link>
      )}

      {status !== "authenticated" ? (
        <Link href="/login" className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem", borderRadius: "30px", border: "2px solid #fff" }}>
          Acceder / Registro
        </Link>
      ) : (
        <div style={{ position: "relative" }}>
          <img 
            src={avatar} 
            alt="User" 
            onClick={() => setOpen(!open)} 
            style={{ width: 42, height: 42, borderRadius: "50%", cursor: "pointer", border: "2px solid #fff" }} 
          />
          {open && (
            <div style={{ position: "absolute", right: 0, top: "50px", background: "#fff", borderRadius: "10px", padding: "10px", boxShadow: "0 5px 20px rgba(0,0,0,0.2)", minWidth: "160px" }}>
              <Link href="/perfil" onClick={() => setOpen(false)} style={{ display: "block", color: "#333", textDecoration: "none", padding: "8px 0" }}>Mi perfil</Link>
              {admin && <Link href="/admin" style={{ display: "block", color: "#d4af37", fontWeight: "bold", textDecoration: "none", padding: "8px 0" }}>Panel Admin</Link>}
              <button onClick={() => signOut()} style={{ border: "none", background: "none", color: "red", cursor: "pointer", padding: "8px 0", width: "100%", textAlign: "left" }}>Cerrar sesión</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
