"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createScreening(formData: {
  tmdbId: number;
  filmTitle: string;
  filmPosterPath: string | null;
  filmGenres: string[];
  filmRating: number | null;
  cinemaId: string;
  datetime: string;
  afterSpot: string;
  cap: number;
  crewId?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("screenings")
    .insert({
      tmdb_id: formData.tmdbId,
      film_title: formData.filmTitle,
      film_poster_path: formData.filmPosterPath,
      film_genres: formData.filmGenres,
      film_rating: formData.filmRating,
      cinema_id: formData.cinemaId,
      datetime: formData.datetime || null,
      after_spot: formData.afterSpot || null,
      organizer_id: user.id,
      cap: formData.cap,
      crew_id: formData.crewId || null,
      status: formData.datetime ? "upcoming" : "draft",
    })
    .select()
    .single();

  if (error) throw error;

  // Auto-join organizer as attendee
  await supabase.from("screening_attendees").insert({
    screening_id: data.id,
    profile_id: user.id,
    status: "confirmed",
  });

  revalidatePath("/screenings");
  redirect(`/screenings/${data.id}`);
}
