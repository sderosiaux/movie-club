"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createCrew(name: string, memberIds: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const allMembers = [user.id, ...memberIds.filter((id) => id !== user.id)];

  const { data: crewId, error } = await supabase.rpc(
    "create_crew_with_members",
    {
      crew_name: name || null,
      member_ids: allMembers,
    }
  );

  if (error || !crewId) throw new Error("Failed to create crew");

  revalidatePath("/crews");
  redirect(`/crews/${crewId}`);
}

export async function proposeFilm(
  crewId: string,
  tmdbId: number,
  filmTitle: string,
  filmPosterPath: string | null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("crew_film_votes").insert({
    crew_id: crewId,
    tmdb_id: tmdbId,
    film_title: filmTitle,
    film_poster_path: filmPosterPath,
    proposed_by: user.id,
  });

  revalidatePath(`/crews/${crewId}`);
}

export async function voteForFilm(voteId: string, crewId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("crew_film_vote_ballots").insert({
    vote_id: voteId,
    profile_id: user.id,
  });

  revalidatePath(`/crews/${crewId}`);
}

export async function createDraftFromVoteWinner(
  crewId: string,
  tmdbId: number,
  filmTitle: string,
  filmPosterPath: string | null,
  filmGenres: string[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("screenings")
    .insert({
      tmdb_id: tmdbId,
      film_title: filmTitle,
      film_poster_path: filmPosterPath,
      film_genres: filmGenres,
      organizer_id: user.id,
      crew_id: crewId,
      status: "draft",
      cap: 6,
    })
    .select()
    .single();

  if (data) {
    await supabase.from("crew_film_votes").delete().eq("crew_id", crewId);
  }

  revalidatePath(`/crews/${crewId}`);
  if (data) redirect(`/screenings/${data.id}`);
}

export async function repostScreening(screeningId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: original } = await supabase
    .from("screenings")
    .select("*")
    .eq("id", screeningId)
    .single();

  if (!original) throw new Error("Screening not found");

  const nextDatetime = original.datetime
    ? new Date(
        new Date(original.datetime).getTime() + 7 * 24 * 60 * 60 * 1000
      ).toISOString()
    : null;

  const { data } = await supabase
    .from("screenings")
    .insert({
      tmdb_id: original.tmdb_id,
      film_title: original.film_title,
      film_poster_path: original.film_poster_path,
      film_genres: original.film_genres,
      film_rating: original.film_rating,
      cinema_id: original.cinema_id,
      datetime: nextDatetime,
      after_spot: original.after_spot,
      organizer_id: user.id,
      cap: original.cap,
      crew_id: original.crew_id,
      status: nextDatetime ? "upcoming" : "draft",
    })
    .select()
    .single();

  if (data) {
    await supabase.from("screening_attendees").insert({
      screening_id: data.id,
      profile_id: user.id,
      status: "confirmed",
    });
  }

  revalidatePath(`/crews/${original.crew_id}`);
  if (data) redirect(`/screenings/${data.id}`);
}
