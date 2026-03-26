import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { fetchLetterboxdDiary } from "@/lib/letterboxd";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // CSRF origin check
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && !origin.includes(host ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const { username } = await request.json();
  if (!username || typeof username !== "string") {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  // Validate username format
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return NextResponse.json({ error: "Invalid username format" }, { status: 400 });
  }

  const diary = await fetchLetterboxdDiary(username);

  // Store in profile's letterboxd_data
  await db
    .update(profiles)
    .set({
      letterboxdUsername: username,
      letterboxdData: {
        diary: diary.slice(0, 50), // last 50 entries
        imported_at: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    })
    .where(eq(profiles.id, userId));

  return NextResponse.json({
    imported: diary.length,
    username,
  });
}
