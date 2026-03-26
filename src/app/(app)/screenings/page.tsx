import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();

  // Fetch cinemas for filters
  const { data: cinemas } = await supabase
    .from("cinemas")
    .select("id, name, borough")
    .order("name");

  // Build screening query
  let query = supabase
    .from("screenings")
    .select(
      `
      *,
      cinema:cinemas(*),
      organizer:profiles!organizer_id(*),
      attendees:screening_attendees(
        profile_id,
        status,
        profile:profiles(id, name, photo_url)
      )
    `
    )
    .eq("status", "upcoming")
    .is("crew_id", null)
    .order("datetime", { ascending: true });

  // Date filter
  const range = dateRange(params.date ?? "all");
  if (range) {
    query = query.gte("datetime", range.gte).lt("datetime", range.lt);
  }

  // Borough filter — filter by cinema's borough via cinema_id
  if (params.borough && params.borough !== "All") {
    const boroughCinemaIds = (cinemas ?? [])
      .filter(
        (c: { borough: string }) =>
          c.borough.toLowerCase() === params.borough!.toLowerCase()
      )
      .map((c: { id: string }) => c.id);

    if (boroughCinemaIds.length > 0) {
      query = query.in("cinema_id", boroughCinemaIds);
    } else {
      // No cinemas in that borough — return empty
      query = query.eq("cinema_id", "00000000-0000-0000-0000-000000000000");
    }
  }

  // Cinema filter
  if (params.cinema && params.cinema !== "all") {
    query = query.eq("cinema_id", params.cinema);
  }

  const { data: screenings } = await query;

  const cinemaList = (cinemas ?? []).map((c: { id: string; name: string }) => ({
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
      {screenings && screenings.length > 0 ? (
        <div className="space-y-3">
          {screenings.map((s) => (
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
