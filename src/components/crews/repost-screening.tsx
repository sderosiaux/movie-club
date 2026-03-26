"use client";

import { useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { repostScreening } from "@/app/(app)/crews/actions";
import { posterUrl } from "@/lib/tmdb";
import { CalendarIcon, Loader2Icon, RefreshCwIcon } from "lucide-react";

type LastScreening = {
  id: string;
  film_title: string;
  film_poster_path: string | null;
  datetime: string | null;
  cinema: { name: string } | null;
};

function formatNextDate(datetime: string): string {
  const next = new Date(
    new Date(datetime).getTime() + 7 * 24 * 60 * 60 * 1000
  );
  return next.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function RepostScreening({
  lastScreening,
}: {
  lastScreening: LastScreening | null;
}) {
  const [pending, startTransition] = useTransition();

  if (!lastScreening) return null;

  function handleRepost() {
    startTransition(async () => {
      await repostScreening(lastScreening!.id);
    });
  }

  return (
    <Card size="sm" className="bg-primary/[0.03] ring-primary/15">
      <CardContent className="flex items-center gap-3">
        {/* Mini poster */}
        <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
          {lastScreening.film_poster_path ? (
            <Image
              src={posterUrl(lastScreening.film_poster_path, "w92")}
              alt={lastScreening.film_title}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <RefreshCwIcon className="size-4 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">Same time next week?</p>
          <p className="text-xs text-muted-foreground truncate">
            {lastScreening.film_title}
            {lastScreening.cinema && ` at ${lastScreening.cinema.name}`}
          </p>
          {lastScreening.datetime && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarIcon className="size-3" />
              {formatNextDate(lastScreening.datetime)}
            </p>
          )}
        </div>

        {/* Action */}
        <Button
          size="lg"
          className="shrink-0 gap-2"
          disabled={pending}
          onClick={handleRepost}
        >
          {pending ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <RefreshCwIcon className="size-4" />
          )}
          Repost
        </Button>
      </CardContent>
    </Card>
  );
}
