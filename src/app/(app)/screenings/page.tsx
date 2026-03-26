import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { screenings, cinemas, profiles, screeningAttendees } from "@/lib/db/schema";
import { eq, and, gte, lt, isNull, inArray, asc } from "drizzle-orm";
import { ScreeningCard } from "@/components/screenings/screening-card";
import { FeedFilters } from "@/components/screenings/feed-filters";
import { Button } from "@/components/ui/button";
import { PlusIcon, FilmIcon } from "lucide-react";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  date?: string;
  borough?: string;
  cinema?: string;
}>;

function dateRange(filter: string): { gte: string; lt: string } | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case "tonight": {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return { gte: now.toISOString(), lt: tomorrow.toISOString() };
    }
    case "this-week": {
      const endOfWeek = new Date(today);
      endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
      return { gte: now.toISOString(), lt: endOfWeek.toISOString() };
    }
    case "this-weekend": {
      const day = today.getDay(); // 0=Sun
      const saturday = new Date(today);
      saturday.setDate(today.getDate() + (6 - day));
      const monday = new Date(saturday);
      monday.setDate(saturday.getDate() + 2);
      return { gte: saturday.toISOString(), lt: monday.toISOString() };
    }
    default:
      return null;
  }
}

export default async function ScreeningsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  // Fetch cinemas for filters
  const allCinemas = await db
    .select({ id: cinemas.id, name: cinemas.name, borough: cinemas.borough })
    .from(cinemas)
    .orderBy(asc(cinemas.name));

  // Build conditions
  const conditions = [
    eq(screenings.status, "upcoming"),
    isNull(screenings.crewId),
  ];

  // Date filter
  const range = dateRange(params.date ?? "all");
  if (range) {
    conditions.push(gte(screenings.datetime, range.gte));
    conditions.push(lt(screenings.datetime, range.lt));
  }

  // Borough filter
  if (params.borough && params.borough !== "All") {
    const boroughCinemaIds = allCinemas
      .filter(
        (c) => c.borough.toLowerCase() === params.borough!.toLowerCase(),
      )
      .map((c) => c.id);

    if (boroughCinemaIds.length > 0) {
      conditions.push(inArray(screenings.cinemaId, boroughCinemaIds));
    } else {
      conditions.push(eq(screenings.cinemaId, "00000000-0000-0000-0000-000000000000"));
    }
  }

  // Cinema filter
  if (params.cinema && params.cinema !== "all") {
    conditions.push(eq(screenings.cinemaId, params.cinema));
  }

  // Fetch screenings with joins
  const rows = await db
    .select({
      screening: screenings,
      cinema: cinemas,
      organizer: profiles,
    })
    .from(screenings)
    .leftJoin(cinemas, eq(screenings.cinemaId, cinemas.id))
    .leftJoin(profiles, eq(screenings.organizerId, profiles.id))
    .where(and(...conditions))
    .orderBy(asc(screenings.datetime));

  // Fetch attendees for all screenings
  const screeningIds = rows.map((r) => r.screening.id);
  const attendeesRaw =
    screeningIds.length > 0
      ? await db
          .select({
            screeningId: screeningAttendees.screeningId,
            profileId: screeningAttendees.profileId,
            status: screeningAttendees.status,
            profile: {
              id: profiles.id,
              name: profiles.name,
              photo_url: profiles.photoUrl,
            },
          })
          .from(screeningAttendees)
          .leftJoin(profiles, eq(screeningAttendees.profileId, profiles.id))
          .where(inArray(screeningAttendees.screeningId, screeningIds))
      : [];

  // Group attendees by screening
  const attendeesByScreening: Record<string, typeof attendeesRaw> = {};
  for (const a of attendeesRaw) {
    if (!attendeesByScreening[a.screeningId]) attendeesByScreening[a.screeningId] = [];
    attendeesByScreening[a.screeningId].push(a);
  }

  // Assemble screenings with nested data
  const screeningsList = rows.map((r) => ({
    ...r.screening,
    cinema: r.cinema,
    organizer: r.organizer,
    attendees: (attendeesByScreening[r.screening.id] ?? []).map((a) => ({
      profile_id: a.profileId,
      status: a.status,
      profile: a.profile,
    })),
  }));

  const cinemaList = allCinemas.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Screenings</h1>
        <Button render={<Link href="/screenings/new" />} size="sm">
          <PlusIcon className="size-4" />
          New Screening
        </Button>
      </div>

      {/* Filters */}
      <Suspense fallback={null}>
        <FeedFilters cinemas={cinemaList} />
      </Suspense>

      {/* Feed */}
      {screeningsList && screeningsList.length > 0 ? (
        <div className="space-y-3">
          {screeningsList.map((s) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <ScreeningCard key={s.id} screening={s as any} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <FilmIcon className="size-6 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-foreground">
            No screenings yet
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Be the first to propose one. Pick a film, choose a cinema, and
            invite others.
          </p>
          <Button
            render={<Link href="/screenings/new" />}
            className="mt-4"
            size="sm"
          >
            <PlusIcon className="size-4" />
            Create a screening
          </Button>
        </div>
      )}
    </div>
  );
}
