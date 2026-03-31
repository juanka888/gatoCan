import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

const providers: any[] = [];
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (googleClientId && googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      checks: ["state"],
      authorization: { params: { scope: "openid email profile", prompt: "select_account" } },
    }),
  );
} else {
  console.warn("[auth] GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET no están configuradas. Google OAuth deshabilitado.");
}

const appBaseUrl = "https://gato-can.vercel.app";

export const authOptions = {
  providers,
  trustHost: true,
  debug: process.env.AUTH_DEBUG === "true",
  session: { strategy: "jwt" as const },
  // adapter: PrismaAdapter(prisma), // Desactivado para aislar el login de la base de datos.
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  callbacks: {
    async signIn() { return true; },
    async jwt({ token, profile }: any) {
      if (profile && typeof profile === "object" && "picture" in profile && !token.picture) token.picture = profile.picture as string;
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = (token.sub || "") as string;
        session.user.name = (session.user.name || token.name) as string | null | undefined;
        session.user.image = (session.user.image || token.picture) as string | null | undefined;
      }
      return session;
    },
    async redirect() { return appBaseUrl; },
  },
};

export const { GET, POST } = NextAuth(authOptions);
