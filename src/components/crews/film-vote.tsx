"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FilmSearch } from "@/components/screenings/film-search";
import {
  proposeFilm,
  voteForFilm,
  createDraftFromVoteWinner,
} from "@/app/(app)/crews/actions";
import { posterUrl } from "@/lib/tmdb";
import type { TMDBFilm } from "@/lib/tmdb";
import {
  CheckIcon,
  Loader2Icon,
  PlusIcon,
  SparklesIcon,
  ThumbsUpIcon,
  XIcon,
} from "lucide-react";

export type FilmVote = {
  id: string;
  tmdb_id: number;
  film_title: string;
  film_poster_path: string | null;
  proposed_by: string;
  ballot_count: number;
  voted_by_me: boolean;
};

type Props = {
  crewId: string;
  votes: FilmVote[];
  currentUserId: string;
  isMyTurn: boolean;
};

export function FilmVotePanel({ crewId, votes, currentUserId, isMyTurn }: Props) {
  const [showSearch, setShowSearch] = useState(false);
  const [selected, setSelected] = useState<TMDBFilm | null>(null);
  const [pendingPropose, startPropose] = useTransition();
  const [pendingVote, startVote] = useTransition();
  const [pendingPick, startPick] = useTransition();
  const [votingId, setVotingId] = useState<string | null>(null);

  function handleSelect(film: TMDBFilm) {
    setSelected(film);
    startPropose(async () => {
      await proposeFilm(crewId, film.id, film.title, film.poster_path);
      setSelected(null);
      setShowSearch(false);
    });
  }

  function handleVote(voteId: string) {
    setVotingId(voteId);
    startVote(async () => {
      await voteForFilm(voteId, crewId);
      setVotingId(null);
    });
  }

  function handlePick(vote: FilmVote) {
    startPick(async () => {
      await createDraftFromVoteWinner(
        crewId,
        vote.tmdb_id,
        vote.film_title,
        vote.film_poster_path,
        []
      );
    });
  }

  // No votes yet — show suggestion prompt
  if (votes.length === 0 && !showSearch) {
    return (
      <Button
        variant="outline"
        size="lg"
        className="w-full justify-start gap-2"
        onClick={() => setShowSearch(true)}
      >
        <PlusIcon className="size-4" />
        Suggest a film
      </Button>
    );
  }

  // Film search mode
  if (showSearch) {
    return (
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Suggest a film</p>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setShowSearch(false);
                setSelected(null);
              }}
              aria-label="Cancel"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
          {pendingPropose ? (
            <div className="flex items-center justify-center py-4">
              <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <FilmSearch
              onSelect={handleSelect}
              selected={selected}
              onClear={() => setSelected(null)}
            />
          )}
        </CardContent>
      </Card>
    );
  }

  // Active votes — show proposed films
  const sorted = [...votes].sort((a, b) => b.ballot_count - a.ballot_count);
  const maxVotes = Math.max(...sorted.map((v) => v.ballot_count), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Film Proposals ({votes.length})
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => setShowSearch(true)}
        >
          <PlusIcon className="size-3.5" />
          Suggest
        </Button>
      </div>

      <ul className="space-y-2">
        {sorted.map((vote) => {
          const isWinner = vote.ballot_count === maxVotes && maxVotes > 0;
          return (
            <li key={vote.id}>
              <Card size="sm">
                <CardContent className="flex items-center gap-3">
                  {/* Poster */}
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                    {vote.film_poster_path ? (
                      <Image
                        src={posterUrl(vote.film_poster_path, "w92")}
                        alt={vote.film_title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <SparklesIcon className="size-4" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {vote.film_title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {vote.ballot_count}{" "}
                      {vote.ballot_count === 1 ? "vote" : "votes"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {vote.voted_by_me ? (
                      <span className="inline-flex items-center gap-1 text-xs text-primary">
                        <CheckIcon className="size-3.5" />
                        Voted
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        disabled={pendingVote && votingId === vote.id}
                        onClick={() => handleVote(vote.id)}
                      >
                        {pendingVote && votingId === vote.id ? (
                          <Loader2Icon className="size-3.5 animate-spin" />
                        ) : (
                          <ThumbsUpIcon className="size-3.5" />
                        )}
                        Vote
                      </Button>
                    )}

                    {isMyTurn && isWinner && (
                      <Button
                        size="sm"
                        className="gap-1.5"
                        disabled={pendingPick}
                        onClick={() => handlePick(vote)}
                      >
                        {pendingPick ? (
                          <Loader2Icon className="size-3.5 animate-spin" />
                        ) : (
                          <SparklesIcon className="size-3.5" />
                        )}
                        Pick
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
