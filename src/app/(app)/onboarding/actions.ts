"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles, profileCinemas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function completeOnboarding(data: {
  name: string;
  photoUrl: string | null;
  neighborhood: string;
  genres: string[];
  letterboxdUsername: string | null;
  cinemaIds: string[];
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  await db
    .update(profiles)
    .set({
      name: data.name.trim(),
      photoUrl: data.photoUrl?.trim() || null,
      neighborhood: data.neighborhood,
      genres: data.genres,
      letterboxdUsername: data.letterboxdUsername?.trim() || null,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(profiles.id, userId));

  // Clear existing cinema associations, then insert new ones
  await db.delete(profileCinemas).where(eq(profileCinemas.profileId, userId));

  if (data.cinemaIds.length > 0) {
    await db.insert(profileCinemas).values(
      data.cinemaIds.map((cinemaId) => ({
        profileId: userId,
        cinemaId,
      })),
    );
  }
}
