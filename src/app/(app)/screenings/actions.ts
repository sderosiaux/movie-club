"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { screenings, screeningAttendees, wouldGoAgain } from "@/lib/db/schema";
import { eq, and, asc, count } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createScreening(formData: {
  tmdbId: number;
  filmTitle: string;
  filmPosterPath: string | null;
  filmGenres: string[];
  filmRating: number | null;
  cinemaId: string;
  datetime: string;
  afterSpot: string;
  cap: number;
  crewId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [data] = await db
    .insert(screenings)
    .values({
      tmdbId: formData.tmdbId,
      filmTitle: formData.filmTitle,
      filmPosterPath: formData.filmPosterPath,
      filmGenres: formData.filmGenres,
      filmRating: formData.filmRating,
      cinemaId: formData.cinemaId,
      datetime: formData.datetime || null,
      afterSpot: formData.afterSpot || null,
      organizerId: userId,
      cap: formData.cap,
      crewId: formData.crewId || null,
      status: formData.datetime ? "upcoming" : "draft",
    })
    .returning();

  // Auto-join organizer as attendee
  await db.insert(screeningAttendees).values({
    screeningId: data.id,
    profileId: userId,
    status: "confirmed",
  });

  revalidatePath("/screenings");
  redirect(`/screenings/${data.id}`);
}

export async function joinScreening(screeningId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [screening] = await db
    .select({ cap: screenings.cap })
    .from(screenings)
    .where(eq(screenings.id, screeningId));

  const [confirmedCount] = await db
    .select({ value: count() })
    .from(screeningAttendees)
    .where(
      and(
        eq(screeningAttendees.screeningId, screeningId),
        eq(screeningAttendees.status, "confirmed"),
      ),
    );

  const status =
    (confirmedCount?.value ?? 0) < (screening?.cap ?? 6)
      ? "confirmed"
      : "waitlisted";

  await db.insert(screeningAttendees).values({
    screeningId,
    profileId: userId,
    status,
  });

  revalidatePath(`/screenings/${screeningId}`);
  revalidatePath("/screenings");
}

export async function leaveScreening(screeningId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  await db
    .delete(screeningAttendees)
    .where(
      and(
        eq(screeningAttendees.screeningId, screeningId),
        eq(screeningAttendees.profileId, userId),
      ),
    );

  // Promote first waitlisted person
  const nextInLine = await db
    .select({ profileId: screeningAttendees.profileId })
    .from(screeningAttendees)
    .where(
      and(
        eq(screeningAttendees.screeningId, screeningId),
        eq(screeningAttendees.status, "waitlisted"),
      ),
    )
    .orderBy(asc(screeningAttendees.joinedAt))
    .limit(1)
    .then((rows) => rows[0]);

  if (nextInLine) {
    await db
      .update(screeningAttendees)
      .set({ status: "confirmed" })
      .where(
        and(
          eq(screeningAttendees.screeningId, screeningId),
          eq(screeningAttendees.profileId, nextInLine.profileId),
        ),
      );
  }

  revalidatePath(`/screenings/${screeningId}`);
  revalidatePath("/screenings");
}

export async function completeScreening(screeningId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  // Only organizer can complete
  await db
    .update(screenings)
    .set({ status: "completed" })
    .where(
      and(eq(screenings.id, screeningId), eq(screenings.organizerId, userId)),
    );

  revalidatePath(`/screenings/${screeningId}`);
}

export async function submitWouldGoAgain(
  screeningId: string,
  selectedUserIds: string[],
) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  if (selectedUserIds.length > 0) {
    const rows = selectedUserIds.map((toId) => ({
      screeningId,
      fromUserId: userId,
      toUserId: toId,
    }));

    await db.insert(wouldGoAgain).values(rows);
  }

  redirect(`/screenings/${screeningId}`);
}
