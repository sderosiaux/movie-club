"use client";

import { useState, useTransition } from "react";
import { createCrew } from "@/app/(app)/crews/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, HeartIcon, Loader2Icon, SparklesIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CrewCandidate } from "@/lib/crew-detection";

type Props = {
  candidates: CrewCandidate[];
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function CrewPrompt({ candidates }: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(candidates.map((c) => c.profile_id))
  );
  const [crewName, setCrewName] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [pending, startTransition] = useTransition();

  if (dismissed || candidates.length === 0) return null;

  const names = candidates
    .filter((c) => selected.has(c.profile_id))
    .map((c) => c.name.split(" ")[0]);

  const totalShared = Math.max(
    ...candidates.map((c) => c.shared_screenings)
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleCreate() {
    if (selected.size === 0) return;
    startTransition(() =>
      createCrew(crewName, Array.from(selected))
    );
  }

  return (
    <Card className="ring-primary/20 ring-2 bg-primary/[0.02]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon className="size-5 text-primary" />
            <CardTitle className="text-lg">You found your people</CardTitle>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Dismiss"
          >
            <XIcon className="size-4" />
          </button>
        </div>
        <CardDescription>
          You&apos;ve been to {totalShared}+ screenings with{" "}
          {names.length <= 2
            ? names.join(" and ")
            : names.slice(0, -1).join(", ") + ", and " + names[names.length - 1]}
          . Want to make it official and start a crew?
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Candidate grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {candidates.map((candidate) => {
            const isSelected = selected.has(candidate.profile_id);
            return (
              <button
                key={candidate.profile_id}
                type="button"
                onClick={() => toggle(candidate.profile_id)}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-xl p-3 transition-all",
                  "ring-1 ring-foreground/10",
                  isSelected
                    ? "bg-primary/5 ring-2 ring-primary"
                    : "bg-card hover:bg-muted/50"
                )}
              >
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <CheckIcon className="size-2.5" />
                  </div>
                )}

                <Avatar>
                  {candidate.photo_url && (
                    <AvatarImage
                      src={candidate.photo_url}
                      alt={candidate.name}
                    />
                  )}
                  <AvatarFallback>
                    {initials(candidate.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center">
                  <span className="text-sm font-medium leading-tight">
                    {candidate.name.split(" ")[0]}
                  </span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {candidate.shared_screenings} shared
                  </p>
                </div>

                {candidate.mutual_would_go_again && (
                  <Badge
                    variant="secondary"
                    className="gap-0.5 text-[10px]"
                  >
                    <HeartIcon className="size-2.5 fill-current" />
                    Mutual
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Crew name input */}
        <div>
          <Input
            placeholder="Crew name (optional)"
            value={crewName}
            onChange={(e) => setCrewName(e.target.value)}
            className="h-9"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Leave blank and we&apos;ll think of something
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          size="lg"
          className="flex-1"
          disabled={pending || selected.size === 0}
          onClick={handleCreate}
        >
          {pending && <Loader2Icon className="size-4 animate-spin" />}
          Start Crew{selected.size > 0 ? ` (${selected.size + 1})` : ""}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => setDismissed(true)}
          disabled={pending}
        >
          Not now
        </Button>
      </CardFooter>
    </Card>
  );
}
