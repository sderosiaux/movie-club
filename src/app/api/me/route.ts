import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(null, { status: 401 });
  }

  const [profile] = await db
    .select({ id: profiles.id, name: profiles.name, photoUrl: profiles.photoUrl })
    .from(profiles)
    .where(eq(profiles.id, session.user.id));

  if (!profile) {
    return NextResponse.json(null, { status: 404 });
  }

  return NextResponse.json(profile);
}
