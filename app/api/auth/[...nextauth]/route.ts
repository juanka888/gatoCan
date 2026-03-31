import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

if (!process.env.NEXTAUTH_SECRET) {
  console.warn("[auth] NEXTAUTH_SECRET no está definido. La sesión puede fallar en producción.");
}

if (!process.env.NEXTAUTH_URL) {
  console.warn("[auth] NEXTAUTH_URL no está definido. Revisa la URL pública del despliegue.");
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
