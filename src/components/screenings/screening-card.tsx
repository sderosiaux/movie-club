import Link from "next/link";
import Image from "next/image";
import { posterUrl } from "@/lib/tmdb";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
} from "@/components/ui/avatar";
import { CalendarIcon, MapPinIcon, StarIcon, UsersIcon } from "lucide-react";
import { initials, formatDatetime } from "@/lib/utils";
import type { Screening } from "@/lib/types";

type Attendee = {
  profile_id: string;
  status: "confirmed" | "waitlisted";
  profile: {
    id: string;
    name: string;
    photo_url: string | null;
  };
};

type Props = {
  screening: Screening & {
    attendees?: Attendee[];
  };
};

export function ScreeningCard({ screening }: Props) {
  const confirmed = screening.attendees?.filter(
    (a) => a.status === "confirmed"
  ) ?? [];
  const spotsLeft = screening.cap - confirmed.length;
  const isFull = spotsLeft <= 0;

  return (
    <Link href={`/screenings/${screening.id}`} className="block group/link">
      <Card className="transition-shadow hover:ring-foreground/20 hover:shadow-md">
        <div className="flex gap-4 px-4">
          {/* Poster */}
          <div className="relative h-[140px] w-[94px] shrink-0 overflow-hidden rounded-md bg-muted">
            <Image
              src={posterUrl(screening.filmPosterPath, "w185")}
              alt={screening.filmTitle}
              fill
              sizes="94px"
              className="object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
            {/* Title + rating */}
            <div>
              <h3 className="truncate text-base font-semibold leading-tight text-foreground">
                {screening.filmTitle}
              </h3>
              {screening.filmRating != null && screening.filmRating > 0 && (
                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <StarIcon className="size-3 fill-amber-400 text-amber-400" />
                  <span>{screening.filmRating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Cinema + datetime */}
            <div className="mt-2 space-y-1">
              {screening.cinema && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPinIcon className="size-3.5 shrink-0" />
                  <span className="truncate">{screening.cinema.name}</span>
                </div>
              )}
              {screening.datetime && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarIcon className="size-3.5 shrink-0" />
                  <span>{formatDatetime(screening.datetime)}</span>
                </div>
              )}
            </div>

            {/* Organizer + attendees + spots */}
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {/* Organizer */}
                {screening.organizer && (
                  <Avatar size="sm">
                    {screening.organizer.photoUrl && (
                      <AvatarImage
                        src={screening.organizer.photoUrl}
                        alt={screening.organizer.name}
                      />
                    )}
                    <AvatarFallback>
                      {initials(screening.organizer.name)}
                    </AvatarFallback>
                  </Avatar>
                )}

                {/* Attendee avatars */}
                {confirmed.length > 1 && (
                  <AvatarGroup>
                    {confirmed.slice(0, 4).map((a) => (
                      <Avatar key={a.profile_id} size="sm">
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
                    ))}
                  </AvatarGroup>
                )}
              </div>

              {/* Spots left badge */}
              {isFull ? (
                <Badge variant="secondary" className="shrink-0">
                  Waitlist
                </Badge>
              ) : (
                <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <UsersIcon className="size-3" />
                  {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left
                </span>
              )}
            </div>

            {/* After-spot */}
            {screening.afterSpot && (
              <p className="mt-1.5 truncate text-xs text-muted-foreground italic">
                {screening.afterSpot}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
