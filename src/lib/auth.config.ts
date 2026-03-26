import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Edge-safe config — no DB imports
// Used by middleware (Edge Runtime) and as base for full auth config

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      // authorize is overridden in auth.ts (Node runtime)
      authorize: () => null,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    session({ session, token }) {
      if (token?.sub) session.user.id = token.sub;
      (session as any).onboardingCompleted = token.onboardingCompleted;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
