"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FilmSearch } from "@/components/screenings/film-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createScreening } from "@/app/(app)/screenings/actions";
import type { TMDBFilm } from "@/lib/tmdb";
import type { Cinema } from "@/lib/types";
import { Loader2Icon } from "lucide-react";

// TMDB genre ID -> name mapping
const TMDB_GENRES: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western",
};

type Props = {
  cinemas: Cinema[];
};

export function ScreeningForm({ cinemas }: Props) {
  const router = useRouter();
  const [selectedFilm, setSelectedFilm] = useState<TMDBFilm | null>(null);
  const [cinemaId, setCinemaId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [cap, setCap] = useState(6);
  const [afterSpot, setAfterSpot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group cinemas by borough
  const cinemasByBorough = cinemas.reduce<Record<string, Cinema[]>>((acc, cinema) => {
    const borough = cinema.borough || "Other";
    if (!acc[borough]) acc[borough] = [];
    acc[borough].push(cinema);
    return acc;
  }, {});

  const canSubmit = selectedFilm && cinemaId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFilm || !cinemaId) return;

    setSubmitting(true);
    setError(null);

    const datetime =
      date && time ? new Date(`${date}T${time}`).toISOString() : "";

    const filmGenres = selectedFilm.genre_ids
      .map((id) => TMDB_GENRES[id])
      .filter(Boolean);

    try {
      await createScreening({
        tmdbId: selectedFilm.id,
        filmTitle: selectedFilm.title,
        filmPosterPath: selectedFilm.poster_path,
        filmGenres,
        filmRating: selectedFilm.vote_average || null,
        cinemaId,
        datetime,
        afterSpot,
        cap,
      });
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>New Screening</CardTitle>
          <CardDescription>
            Pick a film, choose a cinema, and invite your crew.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Film search */}
          <FilmSearch
            selected={selectedFilm}
            onSelect={setSelectedFilm}
            onClear={() => setSelectedFilm(null)}
          />

          {/* Cinema */}
          <div className="space-y-2">
            <Label>Cinema</Label>
            <Select value={cinemaId} onValueChange={(v) => v && setCinemaId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a cinema" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(cinemasByBorough).map(([borough, boroughCinemas]) => (
                  <SelectGroup key={borough}>
                    <SelectLabel>{borough}</SelectLabel>
                    {boroughCinemas.map((cinema) => (
                      <SelectItem key={cinema.id} value={cinema.id}>
                        {cinema.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Cap */}
          <div className="space-y-2">
            <Label htmlFor="cap">Group size</Label>
            <Input
              id="cap"
              type="number"
              min={2}
              max={20}
              value={cap}
              onChange={(e) => setCap(Number(e.target.value))}
              className="w-24"
            />
            <p className="text-xs text-muted-foreground">
              Max people including you (2-20)
            </p>
          </div>

          {/* After-spot */}
          <div className="space-y-2">
            <Label htmlFor="after-spot">
              After-spot <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="after-spot"
              value={afterSpot}
              onChange={(e) => setAfterSpot(e.target.value)}
              placeholder="Bar, restaurant, or park nearby..."
              rows={2}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit || submitting}>
          {submitting ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create screening"
          )}
        </Button>
      </div>
    </form>
  );
}
