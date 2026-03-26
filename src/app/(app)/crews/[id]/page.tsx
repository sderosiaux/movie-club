import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  crews,
  crewMembers,
  profiles,
  screenings,
  screeningAttendees,
  crewFilmVotes,
  crewFilmVoteBallots,
  cinemas,
} from "@/lib/db/schema";
import { eq, inArray, desc, asc, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { posterUrl } from "@/lib/tmdb";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  ArrowLeftIcon,
  CalendarIcon,
  FilmIcon,
} from "lucide-react";
import { FilmVotePanel, type FilmVote } from "@/components/crews/film-vote";
import { RepostScreening } from "@/components/crews/repost-screening";
import { WhatsAppGroupLink } from "@/components/crews/whatsapp-link";
import { initials, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type CrewScreening = {
  id: string;
  film_title: string;
  film_poster_path: string | null;
  datetime: string | null;
  status: string;
  cinema: { name: string } | null;
};

export default async function CrewDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  // Fetch crew
  const [crew] = await db
    .select({ id: crews.id, name: crews.name, createdAt: crews.createdAt })
    .from(crews)
    .where(eq(crews.id, id));

  if (!crew) notFound();

  // Fetch members
  const membersRaw = await db
    .select({
      profileId: crewMembers.profileId,
      turnOrder: crewMembers.turnOrder,
      joinedAt: crewMembers.joinedAt,
      profile: {
        id: profiles.id,
        name: profiles.name,
        photoUrl: profiles.photoUrl,
        neighborhood: profiles.neighborhood,
      },
    })
    .from(crewMembers)
    .innerJoin(profiles, eq(crewMembers.profileId, profiles.id))
    .where(eq(crewMembers.crewId, id))
    .orderBy(asc(crewMembers.turnOrder));

  // Verify current user is a member
  const isMember = membersRaw.some((m) => m.profileId === userId);
  if (!isMember) notFound();

  // Fetch crew screenings
  const crewScreeningsRaw = await db
    .select({
      id: screenings.id,
      filmTitle: screenings.filmTitle,
      filmPosterPath: screenings.filmPosterPath,
      datetime: screenings.datetime,
      status: screenings.status,
      cinemaName: cinemas.name,
    })
    .from(screenings)
    .leftJoin(cinemas, eq(screenings.cinemaId, cinemas.id))
    .where(eq(screenings.crewId, id))
    .orderBy(desc(screenings.datetime));

  const crewScreenings: CrewScreening[] = crewScreeningsRaw.map((s) => ({
    id: s.id,
    film_title: s.filmTitle,
    film_poster_path: s.filmPosterPath,
    datetime: s.datetime,
    status: s.status,
    cinema: s.cinemaName ? { name: s.cinemaName } : null,
  }));

  // Find shared screenings attended by 2+ crew members
  const memberIds = membersRaw.map((m) => m.profileId);

  const sharedRows =
    memberIds.length > 0
      ? await db
          .select({
            screeningId: screeningAttendees.screeningId,
            profileId: screeningAttendees.profileId,
            screening: {
              id: screenings.id,
              filmTitle: screenings.filmTitle,
              filmPosterPath: screenings.filmPosterPath,
              datetime: screenings.datetime,
              status: screenings.status,
              crewId: screenings.crewId,
            },
            cinemaName: cinemas.name,
          })
          .from(screeningAttendees)
          .innerJoin(screenings, eq(screeningAttendees.screeningId, screenings.id))
          .leftJoin(cinemas, eq(screenings.cinemaId, cinemas.id))
          .where(
            and(
              inArray(screeningAttendees.profileId, memberIds),
              eq(screeningAttendees.status, "confirmed"),
            ),
          )
      : [];

  // Group by screening and filter to those with 2+ crew members (excluding crew-specific)
  const screeningAttendance: Record<
    string,
    { screening: CrewScreening; count: number }
  > = {};

  for (const row of sharedRows) {
    const s = row.screening;
    if (s.crewId === id) continue;
    const sid = s.id;
    if (!screeningAttendance[sid]) {
      screeningAttendance[sid] = {
        screening: {
          id: s.id,
          film_title: s.filmTitle,
          film_poster_path: s.filmPosterPath,
          datetime: s.datetime,
          status: s.status,
          cinema: row.cinemaName ? { name: row.cinemaName } : null,
        },
        count: 0,
      };
    }
    screeningAttendance[sid].count++;
  }

  const sharedScreenings = Object.values(screeningAttendance)
    .filter((e) => e.count >= 2)
    .map((e) => e.screening)
    .sort((a, b) => {
      if (!a.datetime) return 1;
      if (!b.datetime) return -1;
      return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
    });

  const allScreenings = [...crewScreenings, ...sharedScreenings];

  // Determine whose turn it is
  const totalScreenings = crewScreenings.length;
  const currentTurnIndex =
    membersRaw.length > 0 ? totalScreenings % membersRaw.length : 0;
  const currentTurnMember = membersRaw[currentTurnIndex];
  const isMyTurn = currentTurnMember?.profileId === userId;

  // Fetch film votes with ballot counts
  const voteRows = await db
    .select({
      id: crewFilmVotes.id,
      tmdbId: crewFilmVotes.tmdbId,
      filmTitle: crewFilmVotes.filmTitle,
      filmPosterPath: crewFilmVotes.filmPosterPath,
      proposedBy: crewFilmVotes.proposedBy,
    })
    .from(crewFilmVotes)
    .where(eq(crewFilmVotes.crewId, id));

  let filmVotes: FilmVote[] = [];

  if (voteRows.length > 0) {
    const voteIds = voteRows.map((v) => v.id);
    const ballots = await db
      .select({ voteId: crewFilmVoteBallots.voteId, profileId: crewFilmVoteBallots.profileId })
      .from(crewFilmVoteBallots)
      .where(inArray(crewFilmVoteBallots.voteId, voteIds));

    const ballotsByVote: Record<string, string[]> = {};
    for (const b of ballots) {
      if (!ballotsByVote[b.voteId]) ballotsByVote[b.voteId] = [];
      ballotsByVote[b.voteId].push(b.profileId);
    }

    filmVotes = voteRows.map((v) => ({
      id: v.id,
      tmdb_id: v.tmdbId,
      film_title: v.filmTitle,
      film_poster_path: v.filmPosterPath,
      proposed_by: v.proposedBy ?? "",
      ballot_count: ballotsByVote[v.id]?.length ?? 0,
      voted_by_me: ballotsByVote[v.id]?.includes(userId) ?? false,
    }));
  }

  // Last completed crew screening (for repost)
  const lastCompleted =
    crewScreenings.find((s) => s.status === "completed") ?? null;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/crews"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        Back to crews
      </Link>

      {/* Crew header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {crew.name || "Unnamed Crew"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Started {crew.createdAt ? formatDate(crew.createdAt) : ""}
        </p>
      </div>

      {/* Turn indicator */}
      {currentTurnMember && membersRaw.length > 1 && (
        <Card className="bg-primary/[0.03] ring-primary/15">
          <CardContent className="flex items-center gap-3">
            <Avatar>
              {currentTurnMember.profile.photoUrl && (
                <AvatarImage
                  src={currentTurnMember.profile.photoUrl}
                  alt={currentTurnMember.profile.name}
                />
              )}
              <AvatarFallback>
                {initials(currentTurnMember.profile.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {currentTurnMember.profileId === userId
                  ? "Your turn to pick!"
                  : `${currentTurnMember.profile.name.split(" ")[0]}'s turn to pick`}
              </p>
              <p className="text-xs text-muted-foreground">
                Screening #{totalScreenings + 1}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Repost -- "Same time next week?" */}
      <RepostScreening lastScreening={lastCompleted} />

      {/* Film voting */}
      <FilmVotePanel
        crewId={id}
        votes={filmVotes}
        currentUserId={userId}
        isMyTurn={isMyTurn}
      />

      {/* WhatsApp group link */}
      <WhatsAppGroupLink
        crewName={crew.name || "Unnamed Crew"}
        memberCount={membersRaw.length}
      />

      <Separator />

      {/* Members */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Members ({membersRaw.length})
        </h2>
        <ul className="space-y-1">
          {membersRaw.map((m, i) => {
            const isTurn = i === currentTurnIndex;
            return (
              <li key={m.profileId}>
                <Link
                  href={`/profile/${m.profile.id}`}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                >
                  <Avatar>
                    {m.profile.photoUrl && (
                      <AvatarImage
                        src={m.profile.photoUrl}
                        alt={m.profile.name}
                      />
                    )}
                    <AvatarFallback>
                      {initials(m.profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">
                      {m.profile.name}
                    </span>
                    {m.profile.neighborhood && (
                      <p className="text-xs text-muted-foreground">
                        {m.profile.neighborhood}
                      </p>
                    )}
                  </div>
                  {isTurn && membersRaw.length > 1 && (
                    <Badge variant="secondary" className="shrink-0">
                      Picking
                    </Badge>
                  )}
                  {m.turnOrder === 0 && (
                    <Badge variant="outline" className="shrink-0 text-xs">
                      Founder
                    </Badge>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <Separator />

      {/* Screening history */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Screening History ({allScreenings.length})
        </h2>

        {allScreenings.length > 0 ? (
          <ul className="space-y-2">
            {allScreenings.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/screenings/${s.id}`}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                >
                  {/* Mini poster */}
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                    {s.film_poster_path ? (
                      <Image
                        src={posterUrl(s.film_poster_path, "w92")}
                        alt={s.film_title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <FilmIcon className="size-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {s.film_title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {s.datetime && (
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="size-3" />
                          {formatDate(s.datetime)}
                        </span>
                      )}
                      {s.cinema && (
                        <span className="truncate">{s.cinema.name}</span>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={s.status === "completed" ? "secondary" : "outline"}
                    className="shrink-0 text-xs"
                  >
                    {s.status}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-8 text-center">
            <FilmIcon className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">
              No screenings yet. Time to plan your first one together!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
