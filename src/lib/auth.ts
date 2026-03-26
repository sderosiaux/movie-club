import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        if (process.env.NODE_ENV === "production") {
          throw new Error("Credentials provider is disabled in production. Configure OAuth.");
        }

        if (!credentials?.email) return null;
        const email = credentials.email as string;

        // Find or create user
        let user = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, email),
        });

        if (!user) {
          const id = crypto.randomUUID();
          await db.insert(schema.users).values({
            id,
            email,
            name: email.split("@")[0],
          });
          user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, id),
          });
        }

        return user ?? null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const profile = await db
          .select({ onboardingCompleted: schema.profiles.onboardingCompleted })
          .from(schema.profiles)
          .where(eq(schema.profiles.id, user.id!))
          .limit(1);
        token.onboardingCompleted = profile[0]?.onboardingCompleted ?? false;
      }
      return token;
    },
    session({ session, token }) {
      if (token?.sub) session.user.id = token.sub;
      (session as any).onboardingCompleted = token.onboardingCompleted;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
