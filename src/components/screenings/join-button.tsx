"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { joinScreening, leaveScreening } from "@/app/(app)/screenings/actions";
import { Loader2Icon, LogInIcon, LogOutIcon, ClockIcon } from "lucide-react";

type Props = {
  screeningId: string;
  isJoined: boolean;
  isOrganizer: boolean;
  isWaitlisted: boolean;
  waitlistPosition: number;
  spotsLeft: number;
};

export function JoinButton({
  screeningId,
  isJoined,
  isOrganizer,
  isWaitlisted,
  waitlistPosition,
  spotsLeft,
}: Props) {
  const [pending, startTransition] = useTransition();

  if (isOrganizer) {
    return (
      <p className="text-sm font-medium text-muted-foreground">
        You're organizing this screening
      </p>
    );
  }

  if (isWaitlisted) {
    return (
      <Button
        variant="outline"
        size="lg"
        className="w-full"
        disabled={pending}
        onClick={() => startTransition(() => leaveScreening(screeningId))}
      >
        {pending ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <ClockIcon className="size-4" />
        )}
        Leave Waitlist (#{waitlistPosition})
      </Button>
    );
  }

  if (isJoined) {
    return (
      <Button
        variant="destructive"
        size="lg"
        className="w-full"
        disabled={pending}
        onClick={() => startTransition(() => leaveScreening(screeningId))}
      >
        {pending ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <LogOutIcon className="size-4" />
        )}
        Leave Screening
      </Button>
    );
  }

  // Not joined — show Join or Join Waitlist
  const isFull = spotsLeft <= 0;

  return (
    <Button
      variant={isFull ? "outline" : "default"}
      size="lg"
      className="w-full"
      disabled={pending}
      onClick={() => startTransition(() => joinScreening(screeningId))}
    >
      {pending ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : isFull ? (
        <ClockIcon className="size-4" />
      ) : (
        <LogInIcon className="size-4" />
      )}
      {isFull ? "Join Waitlist" : `Join${spotsLeft <= 3 ? ` (${spotsLeft} ${spotsLeft === 1 ? "spot" : "spots"} left)` : ""}`}
    </Button>
  );
}
