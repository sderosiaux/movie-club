"use client";

import { useState, useTransition } from "react";
import { submitWouldGoAgain } from "@/app/(app)/screenings/actions";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { CheckIcon, Loader2Icon } from "lucide-react";
import { cn, initials } from "@/lib/utils";

type Attendee = {
  id: string;
  name: string;
  photo_url: string | null;
};

type Props = {
  screeningId: string;
  attendees: Attendee[];
};

export function WouldGoAgain({ screeningId, attendees }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleSubmit() {
    startTransition(() =>
      submitWouldGoAgain(screeningId, Array.from(selected))
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-xl font-bold tracking-tight">
          Who would you go with again?
        </h2>
        <p className="text-sm text-muted-foreground">
          This helps us find your movie crew
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {attendees.map((attendee) => {
          const isSelected = selected.has(attendee.id);
          return (
            <button
              key={attendee.id}
              type="button"
              onClick={() => toggle(attendee.id)}
              className={cn(
                "relative flex flex-col items-center gap-2.5 rounded-xl p-4 transition-all",
                "ring-1 ring-foreground/10",
                isSelected
                  ? "bg-primary/5 ring-2 ring-primary"
                  : "bg-card hover:bg-muted/50"
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <CheckIcon className="size-3" />
                </div>
              )}
              <Avatar size="lg">
                {attendee.photo_url && (
                  <AvatarImage
                    src={attendee.photo_url}
                    alt={attendee.name}
                  />
                )}
                <AvatarFallback>{initials(attendee.name)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{attendee.name}</span>
            </button>
          );
        })}
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={pending}
        onClick={handleSubmit}
      >
        {pending ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : null}
        {selected.size > 0
          ? `Submit (${selected.size} selected)`
          : "Skip"}
      </Button>
    </div>
  );
}
