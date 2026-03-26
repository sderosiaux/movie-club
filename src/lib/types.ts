export type Cinema = {
  id: string;
  name: string;
  slug: string;
  borough: string;
  neighborhood: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
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
  tmdbId: number;
  filmTitle: string;
  filmPosterPath: string | null;
  filmGenres: string[];
  filmRating: number | null;
  cinemaId: string | null;
  datetime: string | null;
  afterSpot: string | null;
  organizerId: string;
  cap: number;
  crewId: string | null;
  status: "draft" | "upcoming" | "completed" | "cancelled";
  createdAt: string;
  cinema?: Cinema | null;
  organizer?: Profile | null;
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
