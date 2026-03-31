"use client";
import { Suspense } from "react";
import { signIn } from "next-auth/react";

function LoginContent() {
  return <main><h1>Iniciando sesión...</h1><button onClick={() => signIn("google")}>Entrar con Google</button></main>;
}

export default function LoginPage() {
  return <Suspense fallback={<main>Cargando...</main>}><LoginContent /></Suspense>;
}
