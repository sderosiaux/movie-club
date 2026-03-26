import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;

  const publicPaths = ["/login", "/"];
  const isPublic = publicPaths.some((p) => nextUrl.pathname === p);

  // Allow Auth.js API routes
  if (nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/screenings", req.url));
  }

  // Redirect to onboarding if not completed
  if (isLoggedIn && nextUrl.pathname !== "/onboarding" && !isPublic) {
    const userId = req.auth?.user?.id;
    if (userId) {
      const rows = db
        .select({ onboardingCompleted: profiles.onboardingCompleted })
        .from(profiles)
        .where(eq(profiles.id, userId))
        .all();

      const profile = rows[0];
      if (profile && !profile.onboardingCompleted) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
