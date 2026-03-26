import { sqliteTable, text, integer, primaryKey, uniqueIndex, index, real } from "drizzle-orm/sqlite-core";

// ─── Auth.js tables ────────────────────────────────────────────────────────────
// Match the exact schema expected by @auth/drizzle-adapter for SQLite

export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

// ─── App tables ────────────────────────────────────────────────────────────────

export const cinemas = sqliteTable("cinema", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  borough: text("borough", {
    enum: ["Brooklyn", "Manhattan", "Queens", "Bronx", "Staten Island"],
  }).notNull(),
  neighborhood: text("neighborhood"),
  address: text("address"),
  websiteUrl: text("website_url"),
  logoUrl: text("logo_url"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const profiles = sqliteTable("profile", {
  id: text("id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  photoUrl: text("photo_url"),
  neighborhood: text("neighborhood"),
  genres: text("genres", { mode: "json" }).$type<string[]>().$defaultFn(() => []),
  letterboxdUsername: text("letterboxd_username"),
  letterboxdData: text("letterboxd_data", { mode: "json" }).$type<Record<string, unknown>>().$defaultFn(() => ({})),
  onboardingCompleted: integer("onboarding_completed", { mode: "boolean" }).default(false),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export const profileCinemas = sqliteTable(
  "profile_cinema",
  {
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    cinemaId: text("cinema_id")
      .notNull()
      .references(() => cinemas.id, { onDelete: "cascade" }),
  },
  (pc) => [primaryKey({ columns: [pc.profileId, pc.cinemaId] })],
);

export const crews = sqliteTable("crew", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const crewMembers = sqliteTable(
  "crew_member",
  {
    crewId: text("crew_id")
      .notNull()
      .references(() => crews.id, { onDelete: "cascade" }),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    joinedAt: text("joined_at").$defaultFn(() => new Date().toISOString()),
    turnOrder: integer("turn_order").notNull().default(0),
  },
  (cm) => [
    primaryKey({ columns: [cm.crewId, cm.profileId] }),
    index("idx_crew_members_profile").on(cm.profileId),
  ],
);

export const screenings = sqliteTable(
  "screening",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tmdbId: integer("tmdb_id").notNull(),
    filmTitle: text("film_title").notNull(),
    filmPosterPath: text("film_poster_path"),
    filmGenres: text("film_genres", { mode: "json" }).$type<string[]>().$defaultFn(() => []),
    filmRating: real("film_rating"),
    cinemaId: text("cinema_id").references(() => cinemas.id),
    datetime: text("datetime"),
    afterSpot: text("after_spot"),
    organizerId: text("organizer_id")
      .notNull()
      .references(() => profiles.id),
    cap: integer("cap").notNull().default(6),
    crewId: text("crew_id").references(() => crews.id),
    status: text("status", {
      enum: ["draft", "upcoming", "completed", "cancelled"],
    })
      .notNull()
      .default("upcoming"),
    createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  },
  (s) => [
    index("idx_screenings_datetime").on(s.datetime),
    index("idx_screenings_cinema").on(s.cinemaId),
    index("idx_screenings_status").on(s.status),
    index("idx_screenings_crew").on(s.crewId),
  ],
);

export const screeningAttendees = sqliteTable(
  "screening_attendee",
  {
    screeningId: text("screening_id")
      .notNull()
      .references(() => screenings.id, { onDelete: "cascade" }),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["confirmed", "waitlisted"] })
      .notNull()
      .default("confirmed"),
    joinedAt: text("joined_at").$defaultFn(() => new Date().toISOString()),
  },
  (sa) => [
    primaryKey({ columns: [sa.screeningId, sa.profileId] }),
    index("idx_screening_attendees_profile").on(sa.profileId),
  ],
);

export const wouldGoAgain = sqliteTable(
  "would_go_again",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    screeningId: text("screening_id")
      .notNull()
      .references(() => screenings.id, { onDelete: "cascade" }),
    fromUserId: text("from_user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    toUserId: text("to_user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  },
  (wga) => [
    uniqueIndex("idx_would_go_again_unique").on(
      wga.screeningId,
      wga.fromUserId,
      wga.toUserId,
    ),
    index("idx_would_go_again_users").on(wga.fromUserId, wga.toUserId),
  ],
);

export const crewFilmVotes = sqliteTable("crew_film_vote", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  crewId: text("crew_id")
    .notNull()
    .references(() => crews.id, { onDelete: "cascade" }),
  tmdbId: integer("tmdb_id").notNull(),
  filmTitle: text("film_title").notNull(),
  filmPosterPath: text("film_poster_path"),
  proposedBy: text("proposed_by").references(() => profiles.id),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const crewFilmVoteBallots = sqliteTable(
  "crew_film_vote_ballot",
  {
    voteId: text("vote_id")
      .notNull()
      .references(() => crewFilmVotes.id, { onDelete: "cascade" }),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
  },
  (b) => [primaryKey({ columns: [b.voteId, b.profileId] })],
);
