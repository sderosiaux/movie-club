import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { authConfig } from "./auth.config";

// Full auth config — Node runtime only (uses better-sqlite3 via db)
// Do NOT import this from middleware — use auth.config.ts instead

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
  callbacks: {
    ...authConfig.callbacks,
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
  },
});
