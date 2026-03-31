"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

export default function Login() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "1rem" }}>Cargando...</main>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const oauthError = useMemo(() => {
    const raw = searchParams.get("error");
    if (!raw) return "";

    const errorMap: Record<string, string> = {
      OAuthSignin: "No se pudo iniciar el flujo OAuth.",
      OAuthCallback: "Fallo al volver de Google. Revisa la URL de callback.",
      OAuthAccountNotLinked: "Ese email ya existe con otro método de acceso.",
      AccessDenied: "Acceso denegado.",
      Configuration: "Configuración de autenticación incompleta.",
      Default: "No se pudo iniciar sesión.",
    };

    return errorMap[raw] || `Error de acceso: ${raw}`;
  }, [searchParams]);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/perfil");
    }
  }, [router, status]);

  useEffect(() => {
    if (oauthError) setMessage(oauthError);
  }, [oauthError]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/perfil",
    });

    setSubmitting(false);

    if (!result || result.error) {
      setMessage("Usuario o contraseña incorrectos.");
      return;
    }

    router.push(result.url || "/perfil");
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    setMessage("");
    setSubmitting(true);
    await signIn("google", { callbackUrl: "/perfil" });
    setSubmitting(false);
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "1rem" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: ".65rem",
          width: "100%",
          maxWidth: 420,
          padding: "1rem",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          background: "#fff",
        }}
      >
        <h1 style={{ margin: 0 }}>Iniciar sesión</h1>
        <p style={{ marginTop: 0 }}>Accede con correo/contraseña o usando tu cuenta de Google.</p>

        <input onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
        <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Contraseña" required />

        <button type="submit" disabled={submitting}>{submitting ? "Entrando..." : "Entrar"}</button>
        <button type="button" onClick={handleGoogleLogin} disabled={submitting}>
          Iniciar sesión con Google
        </button>

        <Link href="/" style={{ textAlign: "center" }}>← Ir a inicio</Link>

        {message ? <p style={{ margin: 0, color: "#b91c1c" }}>{message}</p> : null}
      </form>
    </main>
  );
}
