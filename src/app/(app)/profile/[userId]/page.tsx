import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles, profileCinemas, cinemas, screeningAttendees, screenings } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
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
import { initials, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  // Check if viewer is the profile owner
  const session = await auth();
  const isOwn = session?.user?.id === userId;

  // Fetch profile
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId));

  if (!profile) notFound();

  // Fetch preferred cinemas
  const userCinemas = await db
    .select({ cinema: cinemas })
    .from(profileCinemas)
    .innerJoin(cinemas, eq(profileCinemas.cinemaId, cinemas.id))
    .where(eq(profileCinemas.profileId, userId));

  const cinemaList = userCinemas.map((r) => r.cinema);

  // Fetch recent screenings
  const recentScreeningsRaw = await db
    .select({
      screening: screenings,
      cinemaName: cinemas.name,
    })
    .from(screeningAttendees)
    .innerJoin(screenings, eq(screeningAttendees.screeningId, screenings.id))
    .leftJoin(cinemas, eq(screenings.cinemaId, cinemas.id))
    .where(eq(screeningAttendees.profileId, userId))
    .orderBy(desc(screeningAttendees.joinedAt))
    .limit(10);

  const recentScreenings = recentScreeningsRaw.map((r) => ({
    ...r.screening,
    cinemaName: r.cinemaName,
  }));

  // Sort by datetime descending
  recentScreenings.sort((a, b) => {
    if (!a.datetime && !b.datetime) return 0;
    if (!a.datetime) return 1;
    if (!b.datetime) return -1;
    return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
  });

  const profileInitials = initials(profile.name);

  const genres = (profile.genres ?? []) as string[];

  return (
    <div className="space-y-6">
      {/* Header: avatar + name + neighborhood */}
      <div className="flex items-start gap-4">
        <Avatar className="h-20 w-20 text-xl">
          {profile.photoUrl && (
            <AvatarImage src={profile.photoUrl} alt={profile.name} />
          )}
          <AvatarFallback className="text-lg">{profileInitials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-1 pt-1">
          <h1 className="text-2xl font-bold tracking-tight">{profile.name}</h1>
          {profile.neighborhood && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPinIcon className="h-3.5 w-3.5" />
              {profile.neighborhood}
            </p>
          )}
          {profile.letterboxdUsername && (
            <a
              href={`https://letterboxd.com/${profile.letterboxdUsername}`}
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
      {genres.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Favorite Genres
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {genres.map((genre) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Preferred Cinemas */}
      {cinemaList.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Preferred Cinemas
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {cinemaList.map((cinema) => (
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
                        {s.filmTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.cinemaName ?? ""}
                        {s.datetime && (
                          <>
                            {s.cinemaName && " \u00B7 "}
                            <time>{formatDate(s.datetime)}</time>
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
