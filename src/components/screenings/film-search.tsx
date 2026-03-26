"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SearchIcon, XIcon, StarIcon } from "lucide-react";
import type { TMDBFilm } from "@/lib/tmdb";
import { posterUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

type Props = {
  onSelect: (film: TMDBFilm) => void;
  selected: TMDBFilm | null;
  onClear: () => void;
};

export function FilmSearch({ onSelect, selected, onClear }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBFilm[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/films/search?q=${encodeURIComponent(query)}`);
        const data: TMDBFilm[] = await res.json();
        setResults(data);
        setOpen(data.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback(
    (film: TMDBFilm) => {
      onSelect(film);
      setQuery("");
      setResults([]);
      setOpen(false);
    },
    [onSelect]
  );

  if (selected) {
    return (
      <div className="space-y-2">
        <Label>Film</Label>
        <div className="flex items-center gap-3 rounded-lg border border-border p-3">
          <Image
            src={posterUrl(selected.poster_path, "w92")}
            alt={selected.title}
            width={40}
            height={60}
            className="rounded object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selected.title}</p>
            <p className="text-xs text-muted-foreground">
              {selected.release_date?.slice(0, 4)}
              {selected.vote_average > 0 && (
                <span className="ml-2 inline-flex items-center gap-0.5">
                  <StarIcon className="size-3 fill-amber-400 text-amber-400" />
                  {selected.vote_average.toFixed(1)}
                </span>
              )}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClear}
            aria-label="Clear selection"
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label htmlFor="film-search">Film</Label>
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          id="film-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search for a film..."
          className="pl-8"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="relative z-50">
          <ul className="absolute top-0 left-0 right-0 max-h-72 overflow-y-auto rounded-lg border border-border bg-popover shadow-md">
            {results.map((film) => (
              <li key={film.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted/50"
                  onClick={() => handleSelect(film)}
                >
                  <Image
                    src={posterUrl(film.poster_path, "w92")}
                    alt={film.title}
                    width={32}
                    height={48}
                    className="rounded object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{film.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {film.release_date?.slice(0, 4) || "Unknown year"}
                      {film.vote_average > 0 && (
                        <span className="ml-2 inline-flex items-center gap-0.5">
                          <StarIcon className="size-3 fill-amber-400 text-amber-400" />
                          {film.vote_average.toFixed(1)}
                        </span>
                      )}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
