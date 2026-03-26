import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { screenings, cinemas, profiles, screeningAttendees } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { posterUrl } from "@/lib/tmdb";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { JoinButton } from "@/components/screenings/join-button";
import { CompleteScreeningButton } from "@/components/screenings/complete-screening-button";
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  ExternalLinkIcon,
  StarIcon,
  UsersIcon,
  GlassWaterIcon,
  MessageSquareIcon,
} from "lucide-react";
import { initials, formatDatetime } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Attendee = {
  profile_id: string;
  status: "confirmed" | "waitlisted";
  joined_at: string;
  profile: {
    id: string;
    name: string;
    photo_url: string | null;
  };
};

export default async function ScreeningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch screening with cinema and organizer
  const [row] = await db
    .select({
      screening: screenings,
      cinema: cinemas,
      organizer: profiles,
    })
    .from(screenings)
    .leftJoin(cinemas, eq(screenings.cinemaId, cinemas.id))
    .leftJoin(profiles, eq(screenings.organizerId, profiles.id))
    .where(eq(screenings.id, id));

  if (!row) notFound();

  const screening = row.screening;
  const cinema = row.cinema;
  const organizer = row.organizer;

  // Current user
  const session = await auth();
  const user = session?.user;

  // Fetch attendees
  const attendeesRaw = await db
    .select({
      profileId: screeningAttendees.profileId,
      status: screeningAttendees.status,
      joinedAt: screeningAttendees.joinedAt,
      profile: {
        id: profiles.id,
        name: profiles.name,
        photo_url: profiles.photoUrl,
      },
    })
    .from(screeningAttendees)
    .leftJoin(profiles, eq(screeningAttendees.profileId, profiles.id))
    .where(eq(screeningAttendees.screeningId, id));

  const attendees: Attendee[] = attendeesRaw.map((a) => ({
    profile_id: a.profileId,
    status: a.status as "confirmed" | "waitlisted",
    joined_at: a.joinedAt ?? "",
    profile: {
      id: a.profile?.id ?? a.profileId,
      name: a.profile?.name ?? "",
      photo_url: a.profile?.photo_url ?? null,
    },
  }));

  const confirmed = attendees
    .filter((a) => a.status === "confirmed")
    .sort(
      (a, b) =>
        new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime(),
    );
  const waitlisted = attendees
    .filter((a) => a.status === "waitlisted")
    .sort(
      (a, b) =>
        new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime(),
    );

  const spotsLeft = screening.cap - confirmed.length;
  const isOrganizer = user?.id === screening.organizerId;
  const myAttendance = attendees.find((a) => a.profile_id === user?.id);
  const isJoined = myAttendance?.status === "confirmed";
  const isWaitlisted = myAttendance?.status === "waitlisted";
  const waitlistPosition = isWaitlisted
    ? waitlisted.findIndex((a) => a.profile_id === user?.id) + 1
    : 0;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/screenings"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        Back to screenings
      </Link>

      {/* Hero: poster + film info */}
      <div className="flex flex-col gap-6 sm:flex-row">
        {/* Poster */}
        <div className="relative mx-auto aspect-[2/3] w-48 shrink-0 overflow-hidden rounded-xl bg-muted shadow-lg sm:mx-0 sm:w-56">
          <Image
            src={posterUrl(screening.filmPosterPath, "w500")}
            alt={screening.filmTitle}
            fill
            sizes="(min-width: 640px) 224px, 192px"
            className="object-cover"
            priority
          />
        </div>

        {/* Film details */}
        <div className="flex flex-1 flex-col justify-between space-y-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {screening.filmTitle}
            </h1>

            {/* Rating */}
            {screening.filmRating != null && screening.filmRating > 0 && (
              <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <StarIcon className="size-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">
                  {screening.filmRating.toFixed(1)}
                </span>
              </div>
            )}

            {/* Genres */}
            {screening.filmGenres && (screening.filmGenres as string[]).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(screening.filmGenres as string[]).map((genre: string) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Date + Cinema + After-spot */}
          <div className="space-y-2.5">
            {screening.datetime && (
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                <time className="font-medium">
                  {formatDatetime(screening.datetime)}
                </time>
              </div>
            )}

            {cinema && (
              <div className="flex items-center gap-2 text-sm">
                <MapPinIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="font-medium">{cinema.name}</span>
                {cinema.neighborhood && (
                  <span className="text-muted-foreground">
                    , {cinema.neighborhood}
                  </span>
                )}
                {cinema.websiteUrl && (
                  <a
                    href={cinema.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ExternalLinkIcon className="size-3.5" />
                  </a>
                )}
              </div>
            )}

            {screening.afterSpot && (
              <div className="flex items-center gap-2 text-sm">
                <GlassWaterIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="italic text-muted-foreground">
                  After: {screening.afterSpot}
                </span>
              </div>
            )}
          </div>

          {/* Spots indicator */}
          <div className="flex items-center gap-2 text-sm">
            <UsersIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="font-medium">
              {confirmed.length}/{screening.cap} spots filled
            </span>
            {spotsLeft > 0 ? (
              <span className="text-muted-foreground">
                ({spotsLeft} {spotsLeft === 1 ? "spot remaining" : "spots remaining"})
              </span>
            ) : (
              <Badge variant="secondary" className="ml-1">
                Full
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Join button -- only for upcoming screenings */}
      {user && screening.status === "upcoming" && (
        <JoinButton
          screeningId={screening.id}
          isJoined={isJoined}
          isOrganizer={isOrganizer}
          isWaitlisted={isWaitlisted}
          waitlistPosition={waitlistPosition}
          spotsLeft={spotsLeft}
        />
      )}

      {/* Mark as Complete -- organizer only, upcoming screenings */}
      {user && screening.status === "upcoming" && isOrganizer && (
        <CompleteScreeningButton screeningId={screening.id} />
      )}

      {/* Give Feedback -- completed screenings */}
      {user && screening.status === "completed" && (
        <Link href={`/screenings/${screening.id}/feedback`}>
          <Button variant="outline" size="lg" className="w-full">
            <MessageSquareIcon className="size-4" />
            Give Feedback
          </Button>
        </Link>
      )}

      <Separator />

      {/* Organizer */}
      {organizer && (
        <section className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Organized by
          </h2>
          <Link
            href={`/profile/${organizer.id}`}
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
          >
            <Avatar>
              {organizer.photoUrl && (
                <AvatarImage src={organizer.photoUrl} alt={organizer.name} />
              )}
              <AvatarFallback>{initials(organizer.name)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{organizer.name}</span>
          </Link>
        </section>
      )}

      <Separator />

      {/* Attendees */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Who&apos;s going ({confirmed.length})
        </h2>
        {confirmed.length > 0 ? (
          <ul className="space-y-1">
            {confirmed.map((a) => (
              <li key={a.profile_id}>
                <Link
                  href={`/profile/${a.profile.id}`}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                >
                  <Avatar size="sm">
                    {a.profile.photo_url && (
                      <AvatarImage
                        src={a.profile.photo_url}
                        alt={a.profile.name}
                      />
                    )}
                    <AvatarFallback>
                      {initials(a.profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{a.profile.name}</span>
                  {a.profile_id === screening.organizerId && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      Organizer
                    </Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-3 text-center text-sm text-muted-foreground">
            No one has joined yet. Be the first!
          </p>
        )}
      </section>

      {/* Waitlist */}
      {waitlisted.length > 0 && (
        <>
          <Separator />
          <section className="space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Waitlist ({waitlisted.length})
            </h2>
            <ul className="space-y-1">
              {waitlisted.map((a, i) => (
                <li key={a.profile_id}>
                  <Link
                    href={`/profile/${a.profile.id}`}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {i + 1}
                    </span>
                    <Avatar size="sm">
                      {a.profile.photo_url && (
                        <AvatarImage
                          src={a.profile.photo_url}
                          alt={a.profile.name}
                        />
                      )}
                      <AvatarFallback>
                        {initials(a.profile.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{a.profile.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
