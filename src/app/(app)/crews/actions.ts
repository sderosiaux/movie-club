"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  crews,
  crewMembers,
  crewFilmVotes,
  crewFilmVoteBallots,
  screenings,
  screeningAttendees,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function verifyCrewMembership(crewId: string, userId: string) {
  const member = await db
    .select()
    .from(crewMembers)
    .where(and(eq(crewMembers.crewId, crewId), eq(crewMembers.profileId, userId)))
    .limit(1);
  if (member.length === 0) throw new Error("Not a crew member");
}

export async function createCrew(name: string, memberIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const allMembers = [userId, ...memberIds.filter((id) => id !== userId)];

  // Create crew
  const [crew] = await db
    .insert(crews)
    .values({ name: name || null })
    .returning();

  // Insert members with turn order
  await db.insert(crewMembers).values(
    allMembers.map((profileId, index) => ({
      crewId: crew.id,
      profileId,
      turnOrder: index,
    })),
  );

  revalidatePath("/crews");
  redirect(`/crews/${crew.id}`);
}

export async function proposeFilm(
  crewId: string,
  tmdbId: number,
  filmTitle: string,
  filmPosterPath: string | null,
) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;
  await verifyCrewMembership(crewId, userId);

  await db.insert(crewFilmVotes).values({
    crewId,
    tmdbId,
    filmTitle,
    filmPosterPath,
    proposedBy: userId,
  });

  revalidatePath(`/crews/${crewId}`);
}

export async function voteForFilm(voteId: string, crewId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;
  await verifyCrewMembership(crewId, userId);

  await db.insert(crewFilmVoteBallots).values({
    voteId,
    profileId: userId,
  });

  revalidatePath(`/crews/${crewId}`);
}

export async function createDraftFromVoteWinner(
  crewId: string,
  tmdbId: number,
  filmTitle: string,
  filmPosterPath: string | null,
  filmGenres: string[],
) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;
  await verifyCrewMembership(crewId, userId);

  const [data] = await db
    .insert(screenings)
    .values({
      tmdbId,
      filmTitle,
      filmPosterPath,
      filmGenres,
      organizerId: userId,
      crewId,
      status: "draft",
      cap: 6,
    })
    .returning();

  if (data) {
    await db.delete(crewFilmVotes).where(eq(crewFilmVotes.crewId, crewId));
  }

  revalidatePath(`/crews/${crewId}`);
  if (data) redirect(`/screenings/${data.id}`);
}

export async function repostScreening(screeningId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [original] = await db
    .select()
    .from(screenings)
    .where(eq(screenings.id, screeningId));

  if (!original) throw new Error("Screening not found");
  if (original.crewId) {
    await verifyCrewMembership(original.crewId, userId);
  }

  const nextDatetime = original.datetime
    ? new Date(
        new Date(original.datetime).getTime() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString()
    : null;

  const [data] = await db
    .insert(screenings)
    .values({
      tmdbId: original.tmdbId,
      filmTitle: original.filmTitle,
      filmPosterPath: original.filmPosterPath,
      filmGenres: original.filmGenres,
      filmRating: original.filmRating,
      cinemaId: original.cinemaId,
      datetime: nextDatetime,
      afterSpot: original.afterSpot,
      organizerId: userId,
      cap: original.cap,
      crewId: original.crewId,
      status: nextDatetime ? "upcoming" : "draft",
    })
    .returning();

  if (data) {
    await db.insert(screeningAttendees).values({
      screeningId: data.id,
      profileId: userId,
      status: "confirmed",
    });
  }

  revalidatePath(`/crews/${original.crewId}`);
  if (data) redirect(`/screenings/${data.id}`);
}
