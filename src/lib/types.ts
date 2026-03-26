import type { InferSelectModel } from "drizzle-orm";
import * as schema from "./db/schema";

export type Cinema = InferSelectModel<typeof schema.cinemas>;
export type Profile = InferSelectModel<typeof schema.profiles>;
export type Screening = InferSelectModel<typeof schema.screenings> & {
  cinema?: Cinema | null;
  organizer?: Profile | null;
  attendee_count?: number;
};
export type Crew = InferSelectModel<typeof schema.crews> & {
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
