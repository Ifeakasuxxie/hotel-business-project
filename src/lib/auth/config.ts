import type { NextAuthConfig } from "next-auth";

// Edge-safe Auth.js config shared by the middleware and the full runtime
// instance. Providers and adapter are attached only in index.ts (Node), so
// this file never pulls Prisma or bcrypt into the middleware bundle.
export const authConfig = {
  providers: [],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
