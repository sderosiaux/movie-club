import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { crews, crewMembers, profiles, screenings } from "@/lib/db/schema";
import { eq, inArray, asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
} from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UsersIcon, FilmIcon } from "lucide-react";
import { detectCrewCandidates } from "@/lib/crew-detection";
import { CrewPrompt } from "@/components/crews/crew-prompt";
import { initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CrewsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  // Fetch user's crews
  const myCrewRows = await db
    .select({
      crewId: crewMembers.crewId,
      turnOrder: crewMembers.turnOrder,
      crew: {
        id: crews.id,
        name: crews.name,
        createdAt: crews.createdAt,
      },
    })
    .from(crewMembers)
    .innerJoin(crews, eq(crewMembers.crewId, crews.id))
    .where(eq(crewMembers.profileId, userId))
    .orderBy(asc(crewMembers.turnOrder));

  const crewIds = myCrewRows.map((r) => r.crewId);

  // Fetch members for all crews in one query
  type MemberRow = {
    crewId: string;
    profileId: string;
    turnOrder: number;
    profile: { id: string; name: string; photoUrl: string | null };
  };
  let membersByCrewId: Record<string, MemberRow[]> = {};

  if (crewIds.length > 0) {
    const allMembers = await db
      .select({
        crewId: crewMembers.crewId,
        profileId: crewMembers.profileId,
        turnOrder: crewMembers.turnOrder,
        profile: {
          id: profiles.id,
          name: profiles.name,
          photoUrl: profiles.photoUrl,
        },
      })
      .from(crewMembers)
      .innerJoin(profiles, eq(crewMembers.profileId, profiles.id))
      .where(inArray(crewMembers.crewId, crewIds))
      .orderBy(asc(crewMembers.turnOrder));

    membersByCrewId = allMembers.reduce(
      (acc, m) => {
        if (!acc[m.crewId]) acc[m.crewId] = [];
        acc[m.crewId].push(m);
        return acc;
      },
      {} as Record<string, MemberRow[]>,
    );
  }

  // Count screenings per crew
  let screeningCountByCrewId: Record<string, number> = {};
  if (crewIds.length > 0) {
    const screeningRows = await db
      .select({ crewId: screenings.crewId })
      .from(screenings)
      .where(inArray(screenings.crewId, crewIds));

    screeningCountByCrewId = screeningRows.reduce(
      (acc, s) => {
        const cid = s.crewId as string;
        acc[cid] = (acc[cid] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  // Detect crew candidates for the prompt
  const candidates = await detectCrewCandidates(userId);
  const showPrompt = candidates.length >= 2;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">My Crews</h1>

      {/* Crew formation prompt */}
      {showPrompt && <CrewPrompt candidates={candidates} />}

      {/* Crew list */}
      {myCrewRows.length > 0 ? (
        <div className="space-y-3">
          {myCrewRows.map((row) => {
            const crew = row.crew;
            const members = membersByCrewId[crew.id] ?? [];
            const screeningCount = screeningCountByCrewId[crew.id] ?? 0;
            const currentTurn = members.find(
              (m) =>
                m.turnOrder ===
                screeningCount % members.length,
            );

            return (
              <Link key={crew.id} href={`/crews/${crew.id}`} className="block">
                <Card className="transition-shadow hover:ring-foreground/20 hover:shadow-md">
                  <CardContent className="flex items-center gap-4">
                    {/* Crew info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold truncate">
                        {crew.name || "Unnamed Crew"}
                      </h3>

                      <div className="mt-1.5 flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <UsersIcon className="size-3.5" />
                          {members.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <FilmIcon className="size-3.5" />
                          {screeningCount}{" "}
                          {screeningCount === 1 ? "screening" : "screenings"}
                        </span>
                      </div>

                      {currentTurn && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Turn:{" "}
                          <span className="font-medium text-foreground">
                            {currentTurn.profile.name.split(" ")[0]}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Member avatars */}
                    <AvatarGroup>
                      {members.slice(0, 5).map((m) => (
                        <Avatar key={m.profileId} size="sm">
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
                      ))}
                    </AvatarGroup>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : !showPrompt ? (
        <div className="flex flex-col items-center rounded-2xl bg-gradient-to-b from-amber-50/50 to-transparent border border-amber-200/30 py-20 px-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-amber-100">
            <UsersIcon className="size-7 text-amber-600" />
          </div>
          <h2 className="mt-6 text-xl font-bold">Your crew is out there</h2>
          <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
            It takes 2-3 screenings to find your people. Show up, watch a
            film, stay for the conversation &mdash; we&apos;ll notice when
            the same faces keep coming back.
          </p>
          <Link
            href="/screenings"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-amber-500 px-6 text-sm font-semibold text-amber-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 transition-all"
          >
            Browse screenings
          </Link>
        </div>
      ) : null}
    </div>
  );
}
