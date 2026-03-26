import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Profile, Cinema, Screening } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPinIcon,
  ExternalLinkIcon,
  FilmIcon,
  PencilIcon,
  CalendarIcon,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();

  // Check if viewer is the profile owner
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  const isOwn = currentUser?.id === userId;

  // Fetch profile, cinemas, and recent screenings in parallel
  const [profileRes, cinemasRes, screeningsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase
      .from("profile_cinemas")
      .select("cinema_id, cinemas(*)")
      .eq("profile_id", userId),
    supabase
      .from("screening_attendees")
      .select("screening_id, screenings(*, cinemas(*))")
      .eq("profile_id", userId)
      .order("joined_at", { ascending: false })
      .limit(10),
  ]);

  if (!profileRes.data) notFound();

  const profile = profileRes.data as Profile;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cinemas = (cinemasRes.data ?? [])
    .map((row: any) => row.cinemas)
    .filter(Boolean) as Cinema[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentScreenings = (screeningsRes.data ?? [])
    .map((row: any) => row.screenings)
    .filter(Boolean) as (Screening & { cinemas?: Cinema | null })[];

  // Sort screenings by datetime descending
  recentScreenings.sort((a, b) => {
    if (!a.datetime && !b.datetime) return 0;
    if (!a.datetime) return 1;
    if (!b.datetime) return -1;
    return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
  });

  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Header: avatar + name + neighborhood */}
      <div className="flex items-start gap-4">
        <Avatar className="h-20 w-20 text-xl">
          {profile.photo_url && (
            <AvatarImage src={profile.photo_url} alt={profile.name} />
          )}
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-1 pt-1">
          <h1 className="text-2xl font-bold tracking-tight">{profile.name}</h1>
          {profile.neighborhood && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPinIcon className="h-3.5 w-3.5" />
              {profile.neighborhood}
            </p>
          )}
          {profile.letterboxd_username && (
            <a
              href={`https://letterboxd.com/${profile.letterboxd_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Letterboxd
              <ExternalLinkIcon className="h-3 w-3" />
            </a>
          )}
        </div>

        {isOwn && (
          <Link href="/onboarding">
            <Button variant="outline" size="sm">
              <PencilIcon className="mr-1.5 h-3.5 w-3.5" />
              Edit Profile
            </Button>
          </Link>
        )}
      </div>

      {/* Genres */}
      {profile.genres.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Favorite Genres
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {profile.genres.map((genre) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Preferred Cinemas */}
      {cinemas.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Preferred Cinemas
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {cinemas.map((cinema) => (
              <Badge key={cinema.id} variant="outline">
                {cinema.name}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Recent Screenings */}
      {recentScreenings.length > 0 && (
        <>
          <Separator />
          <section className="space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Recent Screenings
            </h2>
            <ul className="space-y-2">
              {recentScreenings.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/screenings/${s.id}`}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                      <FilmIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">
                        {s.film_title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.cinemas?.name ?? (s.cinema as Cinema)?.name ?? ""}
                        {s.datetime && (
                          <>
                            {(s.cinemas?.name ||
                              (s.cinema as Cinema)?.name) &&
                              " \u00B7 "}
                            <time>
                              {new Date(s.datetime).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </time>
                          </>
                        )}
                      </p>
                    </div>
                    <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {/* Empty state when no screenings */}
      {recentScreenings.length === 0 && (
        <>
          <Separator />
          <section className="space-y-2">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Recent Screenings
            </h2>
            <p className="py-4 text-center text-sm text-muted-foreground">
              {isOwn
                ? "You haven't attended any screenings yet. Join one to get started!"
                : "No screenings attended yet."}
            </p>
          </section>
        </>
      )}
    </div>
  );
}
