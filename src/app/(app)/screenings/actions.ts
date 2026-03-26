"use server";

import { auth } from "@/lib/auth";
import { db, sqlite } from "@/lib/db";
import { screenings, screeningAttendees, wouldGoAgain } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
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

  const joinTx = sqlite.transaction(
    (txScreeningId: string, txUserId: string) => {
      const screening = sqlite
        .prepare("SELECT cap FROM screening WHERE id = ?")
        .get(txScreeningId) as { cap: number } | undefined;
      if (!screening) throw new Error("Screening not found");

      const existing = sqlite
        .prepare(
          "SELECT 1 FROM screening_attendee WHERE screening_id = ? AND profile_id = ?",
        )
        .get(txScreeningId, txUserId);
      if (existing) return;

      const { count } = sqlite
        .prepare(
          "SELECT COUNT(*) as count FROM screening_attendee WHERE screening_id = ? AND status = 'confirmed'",
        )
        .get(txScreeningId) as { count: number };

      const status = count < screening.cap ? "confirmed" : "waitlisted";

      sqlite
        .prepare(
          "INSERT INTO screening_attendee (screening_id, profile_id, status, joined_at) VALUES (?, ?, ?, ?)",
        )
        .run(txScreeningId, txUserId, status, new Date().toISOString());
    },
  );

  joinTx(screeningId, userId);
  revalidatePath(`/screenings/${screeningId}`);
  revalidatePath("/screenings");
}

export async function leaveScreening(screeningId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const leaveTx = sqlite.transaction(
    (txScreeningId: string, txUserId: string) => {
      sqlite
        .prepare(
          "DELETE FROM screening_attendee WHERE screening_id = ? AND profile_id = ?",
        )
        .run(txScreeningId, txUserId);

      const next = sqlite
        .prepare(
          "SELECT profile_id FROM screening_attendee WHERE screening_id = ? AND status = 'waitlisted' ORDER BY joined_at ASC LIMIT 1",
        )
        .get(txScreeningId) as { profile_id: string } | undefined;

      if (next) {
        sqlite
          .prepare(
            "UPDATE screening_attendee SET status = 'confirmed' WHERE screening_id = ? AND profile_id = ?",
          )
          .run(txScreeningId, next.profile_id);
      }
    },
  );

  leaveTx(screeningId, userId);
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
