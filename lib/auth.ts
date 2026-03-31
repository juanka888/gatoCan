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
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "select_account",
        },
      },
    }),
  );
} else {
  console.warn(
    "[auth] GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET no están configuradas. Google OAuth deshabilitado.",
  );
}

const appBaseUrl = "https://gato-can.vercel.app";

export const authOptions = {
  providers,
  trustHost: true,
  debug: process.env.AUTH_DEBUG === "true",
  session: { strategy: "jwt" as const },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  logger: {
    error(code, metadata) {
      console.error("[next-auth][error]", code, metadata);
    },
    warn(code) {
      console.warn("[next-auth][warn]", code);
    },
    debug(code, metadata) {
      if (process.env.AUTH_DEBUG === "true") {
        console.info("[next-auth][debug]", code, metadata);
      }
    },
  },
  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user?.id) {
        token.uid = user.id;
      }

      if (account?.provider === "google" && account.providerAccountId) {
        token.sub = token.sub || account.providerAccountId;
        token.uid = token.uid || account.providerAccountId;
      }

      if (profile && typeof profile === "object" && "picture" in profile && !token.picture) {
        token.picture = profile.picture as string;
      }

      return token;
    },
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = (token.uid || token.sub || user?.id) as string;
        session.user.name = (session.user.name || token.name) as string | null | undefined;
        session.user.image = (session.user.image || token.picture) as string | null | undefined;
      }
      return session;
    },
    async redirect() {
      return appBaseUrl;
    },
  },
};

export const { GET, POST } = NextAuth(authOptions);
