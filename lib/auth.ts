import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

const providers = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      const user = await prisma.user.findUnique({
        where: { email: credentials.email.toLowerCase() },
      });

      if (!user?.password) return null;

      const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
      if (!isPasswordCorrect) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
];

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

export const authOptions: NextAuthOptions = {
  providers,
  trustHost: true,
  debug: process.env.AUTH_DEBUG === "true",
  session: { strategy: "jwt" },
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
      try {
        return true;
      } catch (error) {
        console.error("Error en OAuth:", error);
        return false;
      }
    },
    async jwt({ token, user, account, profile }) {
      if (user?.email) {
        const email = user.email.toLowerCase();
        const existing = await prisma.user.findUnique({ where: { email } });

        const name = user.name || token.name || null;
        const image = user.image || token.picture || null;
        const googleId = account?.provider === "google" ? account.providerAccountId : null;

        if (!existing) {
          const created = await prisma.user.create({
            data: {
              email,
              name,
              image,
              googleId,
            },
          });
          token.uid = created.id;
          token.sub = created.id;
        } else {
          const shouldUpdate =
            (name && name !== existing.name) ||
            (image && image !== existing.image) ||
            (googleId && googleId !== existing.googleId);

          if (shouldUpdate) {
            await prisma.user.update({
              where: { id: existing.id },
              data: {
                name: name ?? existing.name,
                image: image ?? existing.image,
                googleId: googleId ?? existing.googleId,
              },
            });
          }

          token.uid = existing.id;
          token.sub = existing.id;
        }
      }

      if (!token.uid && token.sub) {
        token.uid = token.sub;
      }

      if (!token.uid && token.email) {
        const userByEmail = await prisma.user.findUnique({
          where: { email: token.email.toLowerCase() },
        });
        if (userByEmail) {
          token.uid = userByEmail.id;
          token.sub = userByEmail.id;
        }
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
