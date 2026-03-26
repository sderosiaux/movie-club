import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { posterUrl } from "@/lib/tmdb";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  MessageSquareIcon,
  RefreshCwIcon,
  VoteIcon,
} from "lucide-react";

export const dynamic = "force-dynamic";

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type CrewMember = {
  profile_id: string;
  turn_order: number;
  joined_at: string;
  profile: {
    id: string;
    name: string;
    photo_url: string | null;
    neighborhood: string | null;
  };
};

type CrewScreening = {
  id: string;
  film_title: string;
  film_poster_path: string | null;
  datetime: string | null;
  status: string;
  cinema: {
    name: string;
  } | null;
};

export default async function CrewDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch crew
  const { data: crew } = await supabase
    .from("crews")
    .select("id, name, created_at")
    .eq("id", id)
    .single();

  if (!crew) notFound();

  // Fetch members
  const { data: membersRaw } = await supabase
    .from("crew_members")
    .select(
      "profile_id, turn_order, joined_at, profile:profiles(id, name, photo_url, neighborhood)"
    )
    .eq("crew_id", id)
    .order("turn_order");

  const members = (membersRaw ?? []) as unknown as CrewMember[];

  // Verify current user is a member
  const isMember = members.some((m) => m.profile_id === user.id);
  if (!isMember) notFound();

  // Fetch crew screenings (those with crew_id set)
  const { data: crewScreeningsRaw } = await supabase
    .from("screenings")
    .select("id, film_title, film_poster_path, datetime, status, cinema:cinemas(name)")
    .eq("crew_id", id)
    .order("datetime", { ascending: false });

  // Also find screenings attended by 2+ crew members (organic shared screenings)
  const memberIds = members.map((m) => m.profile_id);

  const { data: sharedScreeningsRaw } = await supabase
    .from("screening_attendees")
    .select(
      "screening_id, profile_id, screening:screenings(id, film_title, film_poster_path, datetime, status, crew_id, cinema:cinemas(name))"
    )
    .in("profile_id", memberIds)
    .eq("status", "confirmed");

  // Group by screening and filter to those with 2+ crew members
  const screeningAttendance: Record<
    string,
    { screening: CrewScreening; count: number }
  > = {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of (sharedScreeningsRaw ?? []) as any[]) {
    const s = row.screening;
    if (!s || s.crew_id === id) continue; // skip crew-specific ones (already fetched)
    const sid = s.id as string;
    if (!screeningAttendance[sid]) {
      screeningAttendance[sid] = {
        screening: {
          id: s.id,
          film_title: s.film_title,
          film_poster_path: s.film_poster_path,
          datetime: s.datetime,
          status: s.status,
          cinema: s.cinema,
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

  const crewScreenings = (crewScreeningsRaw ?? []) as unknown as CrewScreening[];
  const allScreenings = [...crewScreenings, ...sharedScreenings];

  // Determine whose turn it is
  const totalScreenings = crewScreenings.length;
  const currentTurnIndex =
    members.length > 0 ? totalScreenings % members.length : 0;
  const currentTurnMember = members[currentTurnIndex];

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
          Started {formatDate(crew.created_at)}
        </p>
      </div>

      {/* Turn indicator */}
      {currentTurnMember && members.length > 1 && (
        <Card className="bg-primary/[0.03] ring-primary/15">
          <CardContent className="flex items-center gap-3">
            <Avatar>
              {currentTurnMember.profile.photo_url && (
                <AvatarImage
                  src={currentTurnMember.profile.photo_url}
                  alt={currentTurnMember.profile.name}
                />
              )}
              <AvatarFallback>
                {initials(currentTurnMember.profile.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {currentTurnMember.profile_id === user.id
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

      {/* Action buttons (placeholders for Task 14) */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Button variant="outline" size="lg" className="justify-start gap-2" disabled>
          <RefreshCwIcon className="size-4" />
          Same time next week?
        </Button>
        <Button variant="outline" size="lg" className="justify-start gap-2" disabled>
          <VoteIcon className="size-4" />
          Vote on next film
        </Button>
        <Button variant="outline" size="lg" className="justify-start gap-2" disabled>
          <MessageSquareIcon className="size-4" />
          Create group chat
        </Button>
      </div>

      <Separator />

      {/* Members */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Members ({members.length})
        </h2>
        <ul className="space-y-1">
          {members.map((m, i) => {
            const isTurn = i === currentTurnIndex;
            return (
              <li key={m.profile_id}>
                <Link
                  href={`/profile/${m.profile.id}`}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                >
                  <Avatar>
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
                  {isTurn && members.length > 1 && (
                    <Badge variant="secondary" className="shrink-0">
                      Picking
                    </Badge>
                  )}
                  {m.turn_order === 0 && (
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
