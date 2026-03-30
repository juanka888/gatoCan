"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/perfil",
    });
  };

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/perfil" });
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "1rem" }}>
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: ".65rem", width: "100%", maxWidth: 420, padding: "1rem", border: "1px solid #e5e7eb", borderRadius: 12 }}
      >
        <h1 style={{ margin: 0 }}>Iniciar sesión</h1>
        <p style={{ marginTop: 0 }}>Accede con correo/contraseña o usando tu cuenta de Google.</p>

        <input onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
        <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Contraseña" required />
        <button type="submit">Login</button>
        <button type="button" onClick={handleGoogleLogin}>Iniciar sesión con Google</button>
      </form>
    </main>
  );
}
