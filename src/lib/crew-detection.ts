import { db } from "@/lib/db";
import { screeningAttendees, wouldGoAgain, profiles } from "@/lib/db/schema";
import { eq, and, ne, sql } from "drizzle-orm";

export type CrewCandidate = {
  profile_id: string;
  name: string;
  photo_url: string | null;
  shared_screenings: number;
  mutual_would_go_again: boolean;
};

export async function detectCrewCandidates(
  userId: string,
): Promise<CrewCandidate[]> {
  // Find profiles who attended 2+ same screenings as the user
  const myScreenings = db
    .select({ screeningId: screeningAttendees.screeningId })
    .from(screeningAttendees)
    .where(
      and(
        eq(screeningAttendees.profileId, userId),
        eq(screeningAttendees.status, "confirmed"),
      ),
    );

  const sharedRows = await db
    .select({
      profileId: screeningAttendees.profileId,
      sharedCount: sql<number>`count(*)`.as("shared_count"),
    })
    .from(screeningAttendees)
    .where(
      and(
        ne(screeningAttendees.profileId, userId),
        eq(screeningAttendees.status, "confirmed"),
        sql`${screeningAttendees.screeningId} IN (${myScreenings})`,
      ),
    )
    .groupBy(screeningAttendees.profileId)
    .having(sql`count(*) >= 2`);

  if (sharedRows.length === 0) return [];

  // Check mutual would-go-again
  const candidateIds = sharedRows.map((r) => r.profileId);

  const candidates: CrewCandidate[] = [];

  for (const row of sharedRows) {
    // Check if user said "would go again" for this candidate AND vice versa
    const [forward] = await db
      .select({ id: wouldGoAgain.id })
      .from(wouldGoAgain)
      .where(
        and(
          eq(wouldGoAgain.fromUserId, userId),
          eq(wouldGoAgain.toUserId, row.profileId),
        ),
      )
      .limit(1);

    const [backward] = await db
      .select({ id: wouldGoAgain.id })
      .from(wouldGoAgain)
      .where(
        and(
          eq(wouldGoAgain.fromUserId, row.profileId),
          eq(wouldGoAgain.toUserId, userId),
        ),
      )
      .limit(1);

    const mutual = !!forward && !!backward;

    // Fetch profile info
    const [profile] = await db
      .select({ id: profiles.id, name: profiles.name, photoUrl: profiles.photoUrl })
      .from(profiles)
      .where(eq(profiles.id, row.profileId));

    if (profile) {
      candidates.push({
        profile_id: profile.id,
        name: profile.name,
        photo_url: profile.photoUrl,
        shared_screenings: row.sharedCount,
        mutual_would_go_again: mutual,
      });
    }
  }

  return candidates;
}
