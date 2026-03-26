import { createClient } from "@/lib/supabase/server";
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

export const dynamic = "force-dynamic";

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

type CrewRow = {
  crew_id: string;
  turn_order: number;
  crew: {
    id: string;
    name: string | null;
    created_at: string;
  };
};

type CrewMember = {
  profile_id: string;
  turn_order: number;
  profile: {
    id: string;
    name: string;
    photo_url: string | null;
  };
};

export default async function CrewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch user's crews
  const { data: myCrewRows } = await supabase
    .from("crew_members")
    .select("crew_id, turn_order, crew:crews(id, name, created_at)")
    .eq("profile_id", user.id)
    .order("turn_order");

  const crewRows = (myCrewRows ?? []) as unknown as CrewRow[];
  const crewIds = crewRows.map((r) => r.crew_id);

  // Fetch members for all crews in one query
  let membersByCrewId: Record<string, CrewMember[]> = {};
  if (crewIds.length > 0) {
    const { data: allMembers } = await supabase
      .from("crew_members")
      .select(
        "crew_id, profile_id, turn_order, profile:profiles(id, name, photo_url)"
      )
      .in("crew_id", crewIds)
      .order("turn_order");

    const members = (allMembers ?? []) as unknown as (CrewMember & {
      crew_id: string;
    })[];
    membersByCrewId = members.reduce(
      (acc, m) => {
        if (!acc[m.crew_id]) acc[m.crew_id] = [];
        acc[m.crew_id].push(m);
        return acc;
      },
      {} as Record<string, CrewMember[]>
    );
  }

  // Count screenings per crew
  let screeningCountByCrewId: Record<string, number> = {};
  if (crewIds.length > 0) {
    const { data: screeningCounts } = await supabase
      .from("screenings")
      .select("crew_id")
      .in("crew_id", crewIds);

    screeningCountByCrewId = (screeningCounts ?? []).reduce(
      (acc, s) => {
        const cid = s.crew_id as string;
        acc[cid] = (acc[cid] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  // Detect crew candidates for the prompt
  const candidates = await detectCrewCandidates(user.id);

  // Only show prompt if user doesn't already have a crew with all candidates
  const showPrompt = candidates.length >= 2;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">My Crews</h1>

      {/* Crew formation prompt */}
      {showPrompt && <CrewPrompt candidates={candidates} />}

      {/* Crew list */}
      {crewRows.length > 0 ? (
        <div className="space-y-3">
          {crewRows.map((row) => {
            const crew = row.crew;
            const members = membersByCrewId[crew.id] ?? [];
            const screeningCount = screeningCountByCrewId[crew.id] ?? 0;
            const currentTurn = members.find(
              (m) =>
                m.turn_order ===
                (screeningCount % members.length)
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
                        <Avatar key={m.profile_id} size="sm">
                          {m.profile.photo_url && (
                            <AvatarImage
                              src={m.profile.photo_url}
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
        <div className="py-16 text-center">
          <UsersIcon className="mx-auto size-10 text-muted-foreground/40" />
          <h2 className="mt-4 text-lg font-semibold">No crews yet</h2>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-xs mx-auto">
            Keep going to screenings and you&apos;ll find your people. We&apos;ll let you know when it&apos;s time.
          </p>
          <Link
            href="/screenings"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Browse screenings
          </Link>
        </div>
      ) : null}
    </div>
  );
}
