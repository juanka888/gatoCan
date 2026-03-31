import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // Probamos con ambas variables por compatibilidad:
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async redirect({ url, baseUrl }) {
      // Forzamos que tras el login exitoso siempre vaya a la Home
      return baseUrl;
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

// Asegúrate de exportar el handler para el App Router
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
