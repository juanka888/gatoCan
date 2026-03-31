"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useMemo, useState } from "react";

const fallbackAvatar = "/img/default-avatar.svg";

export default function SessionHeader() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

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
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "flex-end",
        padding: "0.6rem 1rem 0",
      }}
    >
      {status !== "authenticated" ? (
        <button type="button" onClick={() => signIn("google", { callbackUrl: "/perfil" })}>
          Acceder
        </button>
      ) : (
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            style={{ border: 0, background: "transparent", cursor: "pointer" }}
            aria-label="Abrir menú de usuario"
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
                background: "#fff",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                boxShadow: "0 10px 20px rgba(0,0,0,.14)",
                padding: ".35rem",
                display: "grid",
                gap: ".2rem",
              }}
            >
              <Link href="/perfil" onClick={() => setOpen(false)}>
                Ir a mi perfil
              </Link>
              <button type="button" onClick={() => signOut({ callbackUrl: "/" })}>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
