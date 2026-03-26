"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "@/app/(app)/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GENRES, NYC_NEIGHBORHOODS } from "@/lib/types";
import type { Cinema, Profile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckIcon, MapPinIcon, FilmIcon, SparklesIcon, UserIcon, PopcornIcon } from "lucide-react";

const STEPS = [
  { title: "Your Name", icon: UserIcon },
  { title: "Neighborhood", icon: MapPinIcon },
  { title: "Cinemas", icon: PopcornIcon },
  { title: "Genres", icon: FilmIcon },
  { title: "Letterboxd", icon: SparklesIcon },
  { title: "All Set", icon: CheckIcon },
] as const;

type Props = {
  profile: Profile;
  cinemas: Cinema[];
};

export function OnboardingWizard({ profile, cinemas }: Props) {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState(profile.name || "");
  const [photoUrl, setPhotoUrl] = useState(profile.photoUrl || "");
  const [neighborhood, setNeighborhood] = useState(profile.neighborhood || "");
  const [selectedCinemas, setSelectedCinemas] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([...(profile.genres || [])]);
  const [letterboxd, setLetterboxd] = useState(profile.letterboxdUsername || "");

  function toggleCinema(id: string) {
    setSelectedCinemas((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function toggleGenre(genre: string) {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  }

  function canProceed(): boolean {
    switch (step) {
      case 0:
        return name.trim().length > 0;
      case 1:
        return neighborhood.length > 0;
      case 2:
        return selectedCinemas.length > 0;
      case 3:
        return selectedGenres.length >= 3;
      default:
        return true;
    }
  }

  async function handleFinish() {
    setSaving(true);
    try {
      await completeOnboarding({
        name: name.trim(),
        photoUrl: photoUrl.trim() || null,
        neighborhood,
        genres: selectedGenres,
        letterboxdUsername: letterboxd.trim() || null,
        cinemaIds: selectedCinemas,
      });

      router.push("/screenings");
    } catch {
      setSaving(false);
    }
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  }

  function back() {
    if (step > 0) {
      setStep(step - 1);
    }
  }

  // Group cinemas by borough
  const cinemasByBorough = cinemas.reduce<Record<string, Cinema[]>>((acc, cinema) => {
    const borough = cinema.borough || "Other";
    if (!acc[borough]) acc[borough] = [];
    acc[borough].push(cinema);
    return acc;
  }, {});

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-1">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= step ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Step indicator */}
      <p className="text-xs text-muted-foreground">
        Step {step + 1} of {STEPS.length}
      </p>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step].title}</CardTitle>
          <CardDescription>
            {step === 0 && "Tell us what to call you."}
            {step === 1 && "Where in NYC are you based?"}
            {step === 2 && "Pick your go-to theaters."}
            {step === 3 && "Select at least 3 genres you love."}
            {step === 4 && "Connect your Letterboxd account (optional)."}
            {step === 5 && "You're ready to go."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Step 0: Name + Photo */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo">Photo URL (optional)</Label>
                <Input
                  id="photo"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          {/* Step 1: Neighborhood */}
          {step === 1 && (
            <div className="space-y-2">
              <Label>Neighborhood</Label>
              <Select value={neighborhood} onValueChange={(v) => v && setNeighborhood(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose your neighborhood" />
                </SelectTrigger>
                <SelectContent>
                  {NYC_NEIGHBORHOODS.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 2: Cinemas */}
          {step === 2 && (
            <div className="space-y-4">
              {Object.entries(cinemasByBorough).map(([borough, boroughCinemas]) => (
                <div key={borough} className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {borough}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {boroughCinemas.map((cinema) => {
                      const isSelected = selectedCinemas.includes(cinema.id);
                      return (
                        <button
                          key={cinema.id}
                          type="button"
                          onClick={() => toggleCinema(cinema.id)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-all",
                            isSelected
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border hover:border-foreground/20 hover:bg-muted/50"
                          )}
                        >
                          {isSelected && (
                            <CheckIcon className="size-3.5 shrink-0 text-primary" />
                          )}
                          <span className={cn("truncate", isSelected && "font-medium")}>
                            {cinema.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Genres */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {GENRES.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                    >
                      <Badge
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer px-3 py-1 text-sm transition-all",
                          isSelected && "ring-1 ring-primary"
                        )}
                      >
                        {genre}
                      </Badge>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedGenres.length} selected
                {selectedGenres.length < 3 && ` (need ${3 - selectedGenres.length} more)`}
              </p>
            </div>
          )}

          {/* Step 4: Letterboxd */}
          {step === 4 && (
            <div className="space-y-2">
              <Label htmlFor="letterboxd">Letterboxd username</Label>
              <Input
                id="letterboxd"
                value={letterboxd}
                onChange={(e) => setLetterboxd(e.target.value)}
                placeholder="your-username"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Optional. We&apos;ll sync your watchlist and ratings later.
              </p>
            </div>
          )}

          {/* Step 5: Done */}
          {step === 5 && (
            <div className="space-y-4 text-center py-4">
              <p className="text-lg font-medium">Find your crew in 2-3 screenings</p>
              <p className="text-sm text-muted-foreground">
                Browse upcoming screenings, RSVP, and meet fellow film lovers near you.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {step > 0 ? (
          <Button variant="ghost" onClick={back}>
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < STEPS.length - 1 ? (
          <Button onClick={next} disabled={!canProceed()}>
            Next
          </Button>
        ) : (
          <Button onClick={handleFinish} disabled={saving}>
            {saving ? "Saving..." : "Browse screenings"}
          </Button>
        )}
      </div>
    </div>
  );
}
