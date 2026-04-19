"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
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
    if (initial) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        session.user.name || "G",
      )}&background=0f4c5c&color=fff`;
    }

    return fallbackAvatar;
  }, [session?.user?.image, session?.user?.name]);

  return (
    <div className="session-header" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {showHomeButton && (
        <Link href="/" className="home-link" style={{ color: "#fff", textDecoration: "none", fontSize: "0.8rem", background: "rgba(0,0,0,0.3)", padding: "5px 10px", borderRadius: "15px" }}>
          ⌂ Volver al inicio
        </Link>
      )}
      {status !== "authenticated" ? (
        <button
          type="button"
          className="session-btn"
          style={{ padding: "8px 18px", fontSize: "0.85rem", borderRadius: "20px", border: "2px solid #fff", color: "#fff", backgroundColor: "rgba(255,255,255,0.1)", cursor: "pointer", fontWeight: "bold" }}
          onClick={() => signIn("google", { callbackUrl: "/perfil" })}
        >
          Acceder
        </button>
      ) : (
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="user-menu-toggle"
            aria-label="Abrir menú de usuario"
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            <img
              src={avatar}
              alt={session.user?.name ? `Avatar de ${session.user.name}` : "Avatar de usuario"}
              style={{
                width: 42,
                height: 42,
                borderRadius: "999px",
                objectFit: "cover",
                border: "2px solid #fff",
              }}
            />
          </button>

          {open && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + .4rem)",
                minWidth: 190,
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(16px)",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.5)",
                boxShadow: "0 10px 20px rgba(0,0,0,.14)",
                padding: ".35rem",
                display: "grid",
                gap: ".2rem",
                zIndex: 2000
              }}
            >
              <Link 
                href="/perfil" 
                onClick={() => setOpen(false)}
                style={{ padding: "10px", color: "#333", textDecoration: "none", fontSize: "14px" }}
              >
                Ir a mi perfil
              </Link>
              {admin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  style={{ color: "#0f4c5c", fontWeight: 800, padding: "10px", textDecoration: "none", fontSize: "14px", borderTop: "1px solid rgba(0,0,0,0.05)" }}
                >
                  🛠️ Panel Admin
                </Link>
              )}
              <button 
                type="button" 
                onClick={() => signOut({ callbackUrl: "/" })}
                style={{ width: "100%", textAlign: "left", padding: "10px", border: "none", background: "none", color: "#e74c3c", cursor: "pointer", fontSize: "14px", borderTop: "1px solid rgba(0,0,0,0.05)" }}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
