import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { Provider } from "next-auth/providers/index";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

// Definimos el array con el tipo Provider[] para permitir múltiples tipos de login
const providers: Provider[] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Por favor, introduce tus datos");
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email.toLowerCase() },
      });

      if (!user || !user.password) {
        throw new Error("No existe una cuenta con este email o debe entrar con Google");
      }

      const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
      
      if (!isPasswordCorrect) {
        throw new Error("Contraseña incorrecta");
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "select_account",
        },
      },
    }),
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user?.email) {
        const email = user.email.toLowerCase();
        const existing = await prisma.user.findUnique({ where: { email } });

        const name = user.name || token.name || null;
        const image = user.image || token.picture || null;
        const googleId = account?.provider === "google" ? account.providerAccountId : null;

        if (!existing) {
          const created = await prisma.user.create({
            data: { email, name, image, googleId },
          });
          token.uid = created.id;
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
        }
      }

      if (!token.uid && token.sub) token.uid = token.sub;

      if (profile && typeof profile === "object" && "picture" in profile && !token.picture) {
        token.picture = (profile as any).picture;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.uid || token.sub;
        session.user.name = token.name;
        session.user.image = token.picture;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/perfil`;
    },
  },
};