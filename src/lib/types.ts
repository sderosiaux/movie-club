export type Cinema = {
  id: string;
  name: string;
  slug: string;
  borough: string;
  neighborhood: string | null;
  website_url: string | null;
  logo_url: string | null;
};

export type Profile = {
  id: string;
  name: string;
  photo_url: string | null;
  neighborhood: string | null;
  genres: string[];
  letterboxd_username: string | null;
  letterboxd_data: Record<string, unknown>;
  onboarding_completed: boolean;
};

export type Screening = {
  id: string;
  tmdb_id: number;
  film_title: string;
  film_poster_path: string | null;
  film_genres: string[];
  film_rating: number | null;
  cinema_id: string | null;
  datetime: string | null;
  after_spot: string | null;
  organizer_id: string;
  cap: number;
  crew_id: string | null;
  status: "draft" | "upcoming" | "completed" | "cancelled";
  created_at: string;
  cinema?: Cinema;
  organizer?: Profile;
  attendee_count?: number;
};

export type Crew = {
  id: string;
  name: string | null;
  created_at: string;
  members?: Profile[];
};

export const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime",
  "Documentary", "Drama", "Fantasy", "Horror", "Mystery",
  "Romance", "Sci-Fi", "Thriller", "War", "Western",
] as const;

export const NYC_NEIGHBORHOODS = [
  "Bed-Stuy", "Bushwick", "Williamsburg", "Greenpoint", "Park Slope",
  "Fort Greene", "Clinton Hill", "Crown Heights", "Prospect Heights",
  "Cobble Hill", "Carroll Gardens", "Gowanus", "Red Hook",
  "Bay Ridge", "Flatbush", "Ditmas Park", "Sunset Park",
  "East Village", "West Village", "Lower East Side", "SoHo",
  "NoHo", "Chelsea", "Hell's Kitchen", "Upper West Side",
  "Upper East Side", "Harlem", "Washington Heights",
  "Astoria", "Long Island City", "Jackson Heights",
  "Other",
] as const;
