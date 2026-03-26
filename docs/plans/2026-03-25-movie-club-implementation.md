# Movie Club Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a PWA for NYC cinephiles to organize small-group screenings and form persistent crews.

**Architecture:** Next.js 15 App Router with Supabase (Postgres + Auth + Realtime). Server Components for the feed, Client Components for interactive forms. TMDB API for film data. Letterboxd RSS for taste import. PWA for installability and push notifications.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Supabase (Postgres + Auth), TMDB API, Vercel

**Design Spec:** `docs/plans/2026-03-25-movie-club-design.md`

---

## Milestone 1: Foundation

### Task 1: Scaffold Project

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `.env.local.example`

**Step 1: Create Next.js 15 project**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

**Step 2: Install shadcn/ui**

```bash
npx shadcn@latest init -d
```

Select: New York style, Zinc base color, CSS variables.

**Step 3: Install Supabase client**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Step 4: Create env template**

```bash
# .env.local.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
TMDB_API_KEY=
```

**Step 5: Create Supabase client utilities**

Create `src/lib/supabase/server.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

Create `src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Step 6: Verify dev server runs**

```bash
npm run dev
```

Expected: App running at localhost:3000.

**Step 7: Commit**

```bash
git add -A && git commit -m "chore: scaffold Next.js 15 + Tailwind + shadcn/ui + Supabase client"
```

---

### Task 2: Database Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

**Step 1: Install Supabase CLI and init**

```bash
npm install -D supabase
npx supabase init
```

**Step 2: Write migration**

```sql
-- supabase/migrations/001_initial_schema.sql

-- Curated cinema list
create table cinemas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  borough text not null check (borough in ('Brooklyn', 'Manhattan', 'Queens', 'Bronx', 'Staten Island')),
  neighborhood text,
  address text,
  website_url text,
  logo_url text,
  created_at timestamptz default now()
);

-- User profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  photo_url text,
  neighborhood text,
  genres text[] default '{}',
  letterboxd_username text,
  letterboxd_data jsonb default '{}',
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Many-to-many: user <-> preferred cinemas
create table profile_cinemas (
  profile_id uuid references profiles(id) on delete cascade,
  cinema_id uuid references cinemas(id) on delete cascade,
  primary key (profile_id, cinema_id)
);

-- Crews
create table crews (
  id uuid primary key default gen_random_uuid(),
  name text,
  created_at timestamptz default now()
);

create table crew_members (
  crew_id uuid references crews(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  turn_order int not null default 0,
  primary key (crew_id, profile_id)
);

-- Screenings
create table screenings (
  id uuid primary key default gen_random_uuid(),
  tmdb_id int not null,
  film_title text not null,
  film_poster_path text,
  film_genres text[] default '{}',
  film_rating numeric(3,1),
  cinema_id uuid references cinemas(id),
  datetime timestamptz, -- nullable = draft
  after_spot text,
  organizer_id uuid references profiles(id) not null,
  cap int not null default 6 check (cap >= 2 and cap <= 20),
  crew_id uuid references crews(id), -- nullable = public
  status text not null default 'upcoming' check (status in ('draft', 'upcoming', 'completed', 'cancelled')),
  created_at timestamptz default now()
);

-- Screening attendees
create table screening_attendees (
  screening_id uuid references screenings(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  status text not null default 'confirmed' check (status in ('confirmed', 'waitlisted')),
  joined_at timestamptz default now(),
  primary key (screening_id, profile_id)
);

-- Post-screening: "would go again"
create table would_go_again (
  id uuid primary key default gen_random_uuid(),
  screening_id uuid references screenings(id) on delete cascade,
  from_user_id uuid references profiles(id) on delete cascade,
  to_user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (screening_id, from_user_id, to_user_id)
);

-- Crew film votes
create table crew_film_votes (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid references crews(id) on delete cascade,
  tmdb_id int not null,
  film_title text not null,
  film_poster_path text,
  proposed_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table crew_film_vote_ballots (
  vote_id uuid references crew_film_votes(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  primary key (vote_id, profile_id)
);

-- Row Level Security
alter table profiles enable row level security;
alter table screenings enable row level security;
alter table screening_attendees enable row level security;
alter table crews enable row level security;
alter table crew_members enable row level security;
alter table would_go_again enable row level security;
alter table crew_film_votes enable row level security;
alter table crew_film_vote_ballots enable row level security;

-- Profiles: public read, own write
create policy "Profiles are publicly readable"
  on profiles for select using (true);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Screenings: public read, organizer write
create policy "Screenings are publicly readable"
  on screenings for select using (
    crew_id is null -- public screenings
    or exists (select 1 from crew_members where crew_id = screenings.crew_id and profile_id = auth.uid())
  );
create policy "Authenticated users can create screenings"
  on screenings for insert with check (auth.uid() = organizer_id);
create policy "Organizers can update own screenings"
  on screenings for update using (auth.uid() = organizer_id);

-- Attendees: public read for screening participants
create policy "Attendees are publicly readable"
  on screening_attendees for select using (true);
create policy "Users can join screenings"
  on screening_attendees for insert with check (auth.uid() = profile_id);
create policy "Users can leave screenings"
  on screening_attendees for delete using (auth.uid() = profile_id);

-- Crews: members only
create policy "Crew members can read crew"
  on crews for select using (
    exists (select 1 from crew_members where crew_id = crews.id and profile_id = auth.uid())
  );
create policy "Authenticated users can create crews"
  on crews for insert with check (true);

create policy "Crew members can read members"
  on crew_members for select using (
    exists (select 1 from crew_members cm where cm.crew_id = crew_members.crew_id and cm.profile_id = auth.uid())
  );
create policy "Crew members can insert members"
  on crew_members for insert with check (auth.uid() = profile_id);

-- Cinemas: public read
alter table cinemas enable row level security;
create policy "Cinemas are publicly readable"
  on cinemas for select using (true);

-- Profile cinemas
alter table profile_cinemas enable row level security;
create policy "Profile cinemas publicly readable"
  on profile_cinemas for select using (true);
create policy "Users manage own cinema prefs"
  on profile_cinemas for insert with check (auth.uid() = profile_id);
create policy "Users delete own cinema prefs"
  on profile_cinemas for delete using (auth.uid() = profile_id);

-- Would go again
create policy "Users can insert own would_go_again"
  on would_go_again for insert with check (auth.uid() = from_user_id);
create policy "Users can read own would_go_again"
  on would_go_again for select using (auth.uid() = from_user_id or auth.uid() = to_user_id);

-- Film votes
create policy "Crew members can read votes"
  on crew_film_votes for select using (
    exists (select 1 from crew_members where crew_id = crew_film_votes.crew_id and profile_id = auth.uid())
  );
create policy "Crew members can propose films"
  on crew_film_votes for insert with check (
    exists (select 1 from crew_members where crew_id = crew_film_votes.crew_id and profile_id = auth.uid())
  );

create policy "Crew members can vote"
  on crew_film_vote_ballots for insert with check (auth.uid() = profile_id);
create policy "Crew members can read ballots"
  on crew_film_vote_ballots for select using (
    exists (
      select 1 from crew_film_votes v
      join crew_members cm on cm.crew_id = v.crew_id
      where v.id = crew_film_vote_ballots.vote_id and cm.profile_id = auth.uid()
    )
  );

-- Indexes
create index idx_screenings_datetime on screenings(datetime);
create index idx_screenings_cinema on screenings(cinema_id);
create index idx_screenings_status on screenings(status);
create index idx_screenings_crew on screenings(crew_id);
create index idx_screening_attendees_profile on screening_attendees(profile_id);
create index idx_would_go_again_users on would_go_again(from_user_id, to_user_id);
create index idx_crew_members_profile on crew_members(profile_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, photo_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

**Step 3: Commit**

```bash
git add supabase/ && git commit -m "feat: add initial database schema with RLS policies"
```

---

### Task 3: Seed Cinema Data

**Files:**
- Create: `supabase/seed.sql`

**Step 1: Write seed data**

```sql
-- supabase/seed.sql
insert into cinemas (name, slug, borough, neighborhood, website_url) values
  ('Nitehawk Cinema Williamsburg', 'nitehawk-williamsburg', 'Brooklyn', 'Williamsburg', 'https://nitehawkcinema.com'),
  ('Nitehawk Cinema Prospect Park', 'nitehawk-prospect-park', 'Brooklyn', 'Park Slope', 'https://nitehawkcinema.com'),
  ('BAM Rose Cinemas', 'bam-rose', 'Brooklyn', 'Fort Greene', 'https://www.bam.org'),
  ('Alamo Drafthouse Brooklyn', 'alamo-brooklyn', 'Brooklyn', 'Downtown Brooklyn', 'https://drafthouse.com'),
  ('Syndicated', 'syndicated', 'Brooklyn', 'Bushwick', 'https://syndicatedbk.com'),
  ('Regal UA Court Street', 'regal-court-street', 'Brooklyn', 'Cobble Hill', 'https://www.regmovies.com'),
  ('Angelika Film Center', 'angelika', 'Manhattan', 'NoHo', 'https://angelikafilmcenter.com'),
  ('IFC Center', 'ifc-center', 'Manhattan', 'Greenwich Village', 'https://www.ifccenter.com'),
  ('Film Forum', 'film-forum', 'Manhattan', 'West Village', 'https://filmforum.org'),
  ('Metrograph', 'metrograph', 'Manhattan', 'Lower East Side', 'https://metrograph.com'),
  ('AMC Lincoln Square', 'amc-lincoln-square', 'Manhattan', 'Upper West Side', 'https://www.amctheatres.com'),
  ('Regal Essex Crossing', 'regal-essex', 'Manhattan', 'Lower East Side', 'https://www.regmovies.com'),
  ('Village East by Angelika', 'village-east', 'Manhattan', 'East Village', 'https://angelikafilmcenter.com'),
  ('Museum of the Moving Image', 'momi', 'Queens', 'Astoria', 'https://movingimage.us')
on conflict (slug) do nothing;
```

**Step 2: Commit**

```bash
git add supabase/seed.sql && git commit -m "feat: seed NYC cinema data"
```

---

### Task 4: Auth Flow

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/auth/callback/route.ts`
- Create: `src/middleware.ts`
- Create: `src/components/auth/login-form.tsx`

**Step 1: Install shadcn components needed**

```bash
npx shadcn@latest add button input card label separator
```

**Step 2: Create auth callback route**

`src/app/auth/callback/route.ts`:
```typescript
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
```

**Step 3: Create login form (magic link + OAuth)**

`src/components/auth/login-form.tsx`:
```typescript
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setSent(true);
  }

  async function handleOAuth(provider: "google" | "apple") {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (sent) {
    return (
      <Card className="w-full max-w-sm mx-auto">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Check your email for the login link.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader>
        <CardTitle>Join Movie Club</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleMagicLink} className="space-y-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Button type="submit" className="w-full">
            Send magic link
          </Button>
        </form>
        <Separator />
        <Button variant="outline" className="w-full" onClick={() => handleOAuth("google")}>
          Continue with Google
        </Button>
        <Button variant="outline" className="w-full" onClick={() => handleOAuth("apple")}>
          Continue with Apple
        </Button>
      </CardContent>
    </Card>
  );
}
```

**Step 4: Create login page**

`src/app/login/page.tsx`:
```typescript
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <LoginForm />
    </main>
  );
}
```

**Step 5: Create middleware for auth protection**

`src/middleware.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const publicPaths = ["/login", "/auth/callback", "/"];
  const isPublic = publicPaths.some((p) => request.nextUrl.pathname === p);

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/screenings", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

**Step 6: Commit**

```bash
git add src/app/login src/app/auth src/middleware.ts src/components/auth && git commit -m "feat: add auth flow with magic link and OAuth"
```

---

### Task 5: Onboarding Flow

**Files:**
- Create: `src/app/onboarding/page.tsx`
- Create: `src/components/onboarding/onboarding-wizard.tsx`
- Create: `src/lib/types.ts`

**Step 1: Define shared types**

`src/lib/types.ts`:
```typescript
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
  // joined
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
```

**Step 2: Build onboarding wizard**

Multi-step form: Name/Photo → Neighborhood → Cinemas → Genres → Letterboxd → Done.

`src/components/onboarding/onboarding-wizard.tsx` — a client component with steps:
1. Name + photo upload
2. Neighborhood (select from `NYC_NEIGHBORHOODS`)
3. Pick cinemas (grid of cinema cards, multi-select, fetched from DB)
4. Pick 3+ genres (grid of genre chips)
5. Letterboxd username (optional input)
6. "Find your crew in 2-3 screenings" message → redirect to `/screenings`

Each step saves to the `profiles` table via Supabase. Final step sets `onboarding_completed = true`.

**Step 3: Add middleware redirect for incomplete onboarding**

In `middleware.ts`, after auth check: if user exists and `onboarding_completed = false` and path is not `/onboarding`, redirect to `/onboarding`.

**Step 4: Commit**

```bash
git add src/app/onboarding src/components/onboarding src/lib/types.ts && git commit -m "feat: add onboarding wizard"
```

---

## Milestone 2: Core Screening Flow

### Task 6: TMDB Service

**Files:**
- Create: `src/lib/tmdb.ts`

**Step 1: Create TMDB client**

```typescript
const TMDB_BASE = "https://api.themoviedb.org/3";

type TMDBFilm = {
  id: number;
  title: string;
  poster_path: string | null;
  genre_ids: number[];
  vote_average: number;
  overview: string;
  release_date: string;
};

type TMDBSearchResult = {
  results: TMDBFilm[];
  total_results: number;
};

export async function searchFilms(query: string): Promise<TMDBFilm[]> {
  const res = await fetch(
    `${TMDB_BASE}/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`,
    { headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` } }
  );
  const data: TMDBSearchResult = await res.json();
  return data.results.slice(0, 10);
}

export async function getFilm(tmdbId: number): Promise<TMDBFilm | null> {
  const res = await fetch(
    `${TMDB_BASE}/movie/${tmdbId}?language=en-US`,
    { headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` } }
  );
  if (!res.ok) return null;
  return res.json();
}

export function posterUrl(path: string | null, size = "w342"): string {
  if (!path) return "/placeholder-poster.svg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
```

**Step 2: Create API route for film search**

`src/app/api/films/search/route.ts`:
```typescript
import { searchFilms } from "@/lib/tmdb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }
  const films = await searchFilms(query);
  return NextResponse.json(films);
}
```

**Step 3: Commit**

```bash
git add src/lib/tmdb.ts src/app/api/films && git commit -m "feat: add TMDB film search service"
```

---

### Task 7: Create Screening

**Files:**
- Create: `src/app/screenings/new/page.tsx`
- Create: `src/components/screenings/screening-form.tsx`
- Create: `src/components/screenings/film-search.tsx`
- Create: `src/app/screenings/actions.ts`

**Step 1: Install additional shadcn components**

```bash
npx shadcn@latest add select dialog command popover calendar badge textarea
```

**Step 2: Build film search component**

`src/components/screenings/film-search.tsx` — debounced input that calls `/api/films/search?q=`, displays results as cards with poster + title + year + rating. On select, passes TMDB data to parent.

**Step 3: Build screening form**

`src/components/screenings/screening-form.tsx`:
- Film search (step 2 component)
- Cinema select (from curated list)
- Date + time picker
- Cap (number input, default 6, min 2, max 20)
- After-spot (optional text input)
- Submit → server action

**Step 4: Create server action**

`src/app/screenings/actions.ts`:
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase.from("screenings").insert({
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
  }).select().single();

  if (error) throw error;

  // Auto-join organizer as attendee
  await supabase.from("screening_attendees").insert({
    screening_id: data.id,
    profile_id: user.id,
    status: "confirmed",
  });

  redirect(`/screenings/${data.id}`);
}
```

**Step 5: Create page**

`src/app/screenings/new/page.tsx` — renders `ScreeningForm` with cinemas fetched server-side.

**Step 6: Commit**

```bash
git add src/app/screenings src/components/screenings && git commit -m "feat: add create screening flow with TMDB search"
```

---

### Task 8: Screening Feed

**Files:**
- Create: `src/app/screenings/page.tsx`
- Create: `src/components/screenings/screening-card.tsx`
- Create: `src/components/screenings/feed-filters.tsx`

**Step 1: Build screening card**

`src/components/screenings/screening-card.tsx` — displays:
- Film poster (from TMDB `posterUrl`)
- Title + rating
- Cinema name + datetime (formatted)
- Organizer avatar + name
- Attendee avatars + "X spots left"
- After-spot if set
- "Join" button

**Step 2: Build feed filters**

`src/components/screenings/feed-filters.tsx` — client component with:
- Date filter: Tonight / This Week / This Weekend / All
- Borough filter: select from boroughs
- Cinema filter: select from cinema list
- Genre filter: multi-select

Filters update URL search params. Feed page reads search params server-side.

**Step 3: Build feed page (Server Component)**

`src/app/screenings/page.tsx`:
```typescript
import { createClient } from "@/lib/supabase/server";
import { ScreeningCard } from "@/components/screenings/screening-card";
import { FeedFilters } from "@/components/screenings/feed-filters";

export default async function ScreeningsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("screenings")
    .select(`
      *,
      cinema:cinemas(*),
      organizer:profiles!organizer_id(*),
      attendees:screening_attendees(count)
    `)
    .eq("status", "upcoming")
    .is("crew_id", null) // public only
    .order("datetime", { ascending: true });

  // Apply filters from search params
  if (params.borough) {
    query = query.eq("cinema.borough", params.borough);
  }
  if (params.cinema) {
    query = query.eq("cinema_id", params.cinema);
  }

  const { data: screenings } = await query;

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Screenings</h1>
        <a href="/screenings/new">
          <Button>+ New Screening</Button>
        </a>
      </div>
      <FeedFilters />
      <div className="space-y-4">
        {screenings?.map((s) => (
          <ScreeningCard key={s.id} screening={s} />
        ))}
        {screenings?.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            No screenings yet. Be the first to propose one.
          </p>
        )}
      </div>
    </main>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/screenings/page.tsx src/components/screenings && git commit -m "feat: add screening feed with filters"
```

---

### Task 9: Screening Detail + Join/Waitlist

**Files:**
- Create: `src/app/screenings/[id]/page.tsx`
- Create: `src/components/screenings/join-button.tsx`
- Add to: `src/app/screenings/actions.ts`

**Step 1: Add join/leave server actions**

In `src/app/screenings/actions.ts`, add:
```typescript
export async function joinScreening(screeningId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get current attendee count and cap (use transaction-safe approach)
  const { data: screening } = await supabase
    .from("screenings")
    .select("cap")
    .eq("id", screeningId)
    .single();

  const { count } = await supabase
    .from("screening_attendees")
    .select("*", { count: "exact", head: true })
    .eq("screening_id", screeningId)
    .eq("status", "confirmed");

  const status = (count ?? 0) < (screening?.cap ?? 6) ? "confirmed" : "waitlisted";

  await supabase.from("screening_attendees").insert({
    screening_id: screeningId,
    profile_id: user.id,
    status,
  });

  revalidatePath(`/screenings/${screeningId}`);
}

export async function leaveScreening(screeningId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("screening_attendees")
    .delete()
    .eq("screening_id", screeningId)
    .eq("profile_id", user.id);

  // Promote first waitlisted person
  const { data: nextInLine } = await supabase
    .from("screening_attendees")
    .select("profile_id")
    .eq("screening_id", screeningId)
    .eq("status", "waitlisted")
    .order("joined_at")
    .limit(1)
    .single();

  if (nextInLine) {
    await supabase.from("screening_attendees")
      .update({ status: "confirmed" })
      .eq("screening_id", screeningId)
      .eq("profile_id", nextInLine.profile_id);
  }

  revalidatePath(`/screenings/${screeningId}`);
}
```

**Step 2: Build detail page**

`src/app/screenings/[id]/page.tsx` — Server Component showing:
- Full film info (poster large, synopsis from TMDB, genres, rating)
- Cinema + datetime + after-spot
- Organizer card
- Attendee list (avatars + names)
- Waitlist count if applicable
- Join/Leave button (client component)

**Step 3: Build join button**

`src/components/screenings/join-button.tsx` — client component that shows:
- "Join" if not joined and spots available
- "Join Waitlist (position #N)" if full
- "Leave" if already joined
- Disabled if user is the organizer

**Step 4: Commit**

```bash
git add src/app/screenings/[id] src/components/screenings/join-button.tsx && git commit -m "feat: add screening detail page with join/waitlist"
```

---

## Milestone 3: Profiles & Letterboxd

### Task 10: Profile Page

**Files:**
- Create: `src/app/profile/[id]/page.tsx`
- Create: `src/components/profile/profile-card.tsx`

**Step 1: Build profile page**

Server Component showing:
- Photo, name, neighborhood
- Preferred cinemas (chips)
- Favorite genres (chips)
- Letterboxd link (if connected)
- Recent screenings attended
- Crews (if viewer is in same crew)

**Step 2: Commit**

```bash
git add src/app/profile src/components/profile && git commit -m "feat: add profile page"
```

---

### Task 11: Letterboxd RSS Import

**Files:**
- Create: `src/lib/letterboxd.ts`
- Create: `src/app/api/letterboxd/import/route.ts`

**Step 1: Build RSS parser**

```typescript
// src/lib/letterboxd.ts
type LetterboxdEntry = {
  title: string;
  year: string;
  rating: number | null;
  watchedDate: string;
  link: string;
};

export async function fetchLetterboxdDiary(username: string): Promise<LetterboxdEntry[]> {
  const res = await fetch(`https://letterboxd.com/${username}/rss/`, {
    next: { revalidate: 3600 }, // cache 1h
  });
  if (!res.ok) return [];

  const xml = await res.text();
  // Parse XML items — extract title, letterboxd:memberRating, letterboxd:watchedDate
  // Use regex or lightweight XML parser (no heavy dependency)
  const entries: LetterboxdEntry[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title = item.match(/<letterboxd:filmTitle>(.*?)<\/letterboxd:filmTitle>/)?.[1] ?? "";
    const year = item.match(/<letterboxd:filmYear>(.*?)<\/letterboxd:filmYear>/)?.[1] ?? "";
    const rating = item.match(/<letterboxd:memberRating>(.*?)<\/letterboxd:memberRating>/)?.[1];
    const watchedDate = item.match(/<letterboxd:watchedDate>(.*?)<\/letterboxd:watchedDate>/)?.[1] ?? "";
    const link = item.match(/<link>(.*?)<\/link>/)?.[1] ?? "";

    entries.push({
      title,
      year,
      rating: rating ? parseFloat(rating) : null,
      watchedDate,
      link,
    });
  }
  return entries;
}
```

**Step 2: Create import API route**

Fetches RSS, stores parsed data in `profiles.letterboxd_data` as JSON.

**Step 3: Commit**

```bash
git add src/lib/letterboxd.ts src/app/api/letterboxd && git commit -m "feat: add Letterboxd RSS import"
```

---

## Milestone 4: Post-Screening & Crews

### Task 12: "Would Go Again" Post-Screening

**Files:**
- Create: `src/app/screenings/[id]/feedback/page.tsx`
- Create: `src/components/screenings/would-go-again.tsx`
- Add to: `src/app/screenings/actions.ts`

**Step 1: Build feedback page**

After a screening is marked `completed`, attendees see:
- "Who would you go with again?" — grid of attendee avatars, tap to select (multi-select)
- Submit saves `would_go_again` rows (one per selected person)
- Mutual selections feed crew formation detection (Task 13)

**Step 2: Add server action**

```typescript
export async function submitWouldGoAgain(screeningId: string, selectedUserIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const rows = selectedUserIds.map((toId) => ({
    screening_id: screeningId,
    from_user_id: user.id,
    to_user_id: toId,
  }));

  await supabase.from("would_go_again").insert(rows);
  redirect(`/screenings/${screeningId}`);
}
```

**Step 3: Commit**

```bash
git add src/app/screenings/[id]/feedback src/components/screenings/would-go-again.tsx && git commit -m "feat: add post-screening 'would go again' feedback"
```

---

### Task 13: Crew Formation

**Files:**
- Create: `src/lib/crew-detection.ts`
- Create: `src/components/crews/crew-prompt.tsx`
- Create: `src/app/crews/actions.ts`
- Create: `src/app/crews/[id]/page.tsx`

**Step 1: Build crew detection query**

```typescript
// src/lib/crew-detection.ts
import { createClient } from "@/lib/supabase/server";

// Find users who attended 3+ screenings together AND have mutual "would go again"
export async function detectPotentialCrew(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase.rpc("detect_crew_candidates", {
    target_user_id: userId,
    min_shared_screenings: 3,
  });

  return data; // returns profiles with shared_count and mutual_would_go_again
}
```

Requires a Postgres function `detect_crew_candidates` in a new migration.

**Step 2: Add migration for crew detection function**

```sql
-- supabase/migrations/002_crew_detection.sql
create or replace function detect_crew_candidates(
  target_user_id uuid,
  min_shared_screenings int default 3
)
returns table (
  profile_id uuid,
  name text,
  photo_url text,
  shared_screenings bigint,
  mutual_would_go_again boolean
)
language sql stable as $$
  select
    p.id as profile_id,
    p.name,
    p.photo_url,
    count(distinct sa2.screening_id) as shared_screenings,
    exists (
      select 1 from would_go_again w1
      join would_go_again w2 on w1.to_user_id = w2.from_user_id and w1.from_user_id = w2.to_user_id
      where w1.from_user_id = target_user_id and w1.to_user_id = p.id
    ) as mutual_would_go_again
  from screening_attendees sa1
  join screening_attendees sa2 on sa1.screening_id = sa2.screening_id and sa1.profile_id != sa2.profile_id
  join profiles p on p.id = sa2.profile_id
  where sa1.profile_id = target_user_id
    and sa1.status = 'confirmed'
    and sa2.status = 'confirmed'
  group by p.id, p.name, p.photo_url
  having count(distinct sa2.screening_id) >= min_shared_screenings
  order by count(distinct sa2.screening_id) desc;
$$;
```

**Step 3: Build crew prompt component**

Shows after a screening: "You've seen N films with X, Y, Z. Start a crew?"
Displays candidates with shared count and mutual signal.
"Create crew" button → creates crew + adds members.

**Step 4: Build crew creation action**

```typescript
export async function createCrew(name: string, memberIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: crew } = await supabase.from("crews").insert({ name }).select().single();
  if (!crew) throw new Error("Failed to create crew");

  const members = [user.id, ...memberIds].map((id, i) => ({
    crew_id: crew.id,
    profile_id: id,
    turn_order: i,
  }));

  await supabase.from("crew_members").insert(members);
  redirect(`/crews/${crew.id}`);
}
```

**Step 5: Build crew dashboard page**

`src/app/crews/[id]/page.tsx`:
- Crew name + members (avatars)
- Shared screening history (films watched together)
- Current film vote (if active)
- "Whose turn?" indicator
- "Same time next week?" button
- "Create WhatsApp group" button

**Step 6: Commit**

```bash
git add src/lib/crew-detection.ts src/components/crews src/app/crews supabase/migrations/002* && git commit -m "feat: add crew formation with detection and dashboard"
```

---

### Task 14: Crew Features (Voting, Rotation, Repost, WhatsApp)

**Files:**
- Create: `src/components/crews/film-vote.tsx`
- Create: `src/components/crews/repost-screening.tsx`
- Create: `src/components/crews/whatsapp-link.tsx`
- Add to: `src/app/crews/actions.ts`

**Step 1: Film voting**

- Any crew member proposes films (TMDB search)
- Members vote (tap to vote, one vote per film)
- Winner = most votes → creates a `draft` screening with film pre-filled
- Organizer (current turn) completes with cinema + datetime

**Step 2: "Same time next week?" one-tap repost**

```typescript
export async function repostScreening(screeningId: string) {
  const supabase = await createClient();
  const { data: original } = await supabase
    .from("screenings")
    .select("*")
    .eq("id", screeningId)
    .single();

  if (!original) throw new Error("Screening not found");

  // Same everything, datetime +7 days
  const nextDatetime = original.datetime
    ? new Date(new Date(original.datetime).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    : null;

  // Create new screening (organizer = next in rotation)
  const { data } = await supabase.from("screenings").insert({
    ...original,
    id: undefined,
    created_at: undefined,
    datetime: nextDatetime,
    status: nextDatetime ? "upcoming" : "draft",
  }).select().single();

  redirect(`/screenings/${data!.id}`);
}
```

**Step 3: WhatsApp group link**

```typescript
// src/components/crews/whatsapp-link.tsx
"use client";

export function WhatsAppGroupLink({ crewName, memberCount }: { crewName: string; memberCount: number }) {
  const message = encodeURIComponent(
    `Movie Club crew "${crewName}" (${memberCount} members) — let's coordinate here!`
  );
  // WhatsApp doesn't support pre-creating groups via URL,
  // but we can open a share intent with the crew info
  const url = `https://wa.me/?text=${message}`;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="...">
      Create WhatsApp group
    </a>
  );
}
```

**Step 4: Commit**

```bash
git add src/components/crews src/app/crews && git commit -m "feat: add crew voting, repost, and WhatsApp link"
```

---

## Milestone 5: PWA & Navigation

### Task 15: App Layout & Navigation

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/components/nav/bottom-nav.tsx`
- Create: `src/components/nav/header.tsx`

**Step 1: Build bottom navigation**

Mobile-first bottom nav with 4 tabs:
- Screenings (feed) — film icon
- My Crews — people icon
- New Screening — plus icon (centered, prominent)
- Profile — avatar

**Step 2: Build header**

App name "Movie Club" + user avatar dropdown (profile, settings, logout).

**Step 3: Commit**

```bash
git add src/app/layout.tsx src/components/nav && git commit -m "feat: add app layout with bottom nav"
```

---

### Task 16: PWA Setup

**Files:**
- Create: `public/manifest.json`
- Create: `src/app/manifest.ts`
- Modify: `src/app/layout.tsx`

**Step 1: Create web manifest**

```typescript
// src/app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Movie Club",
    short_name: "Movie Club",
    description: "Find your movie crew in NYC",
    start_url: "/screenings",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#09090b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
```

**Step 2: Add meta tags to layout**

```typescript
export const metadata: Metadata = {
  title: "Movie Club",
  description: "Find your movie crew in NYC",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Movie Club",
  },
};
```

**Step 3: Commit**

```bash
git add public/manifest.json src/app/manifest.ts && git commit -m "feat: add PWA manifest and meta tags"
```

---

### Task 17: Landing Page

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Build landing page**

Public page (no auth required) with:
- Hero: "Find your movie crew in NYC"
- Subtitle: "Small groups. Real conversations. After the credits."
- CTA: "Join Movie Club" → `/login`
- How it works: 3 steps (Browse screenings → Join a group → Form your crew)
- Social proof: "Join 50+ NYC cinephiles" (dynamic count from DB)

**Step 2: Commit**

```bash
git add src/app/page.tsx && git commit -m "feat: add landing page"
```

---

## Task Summary

| # | Task | Milestone | Depends on |
|---|------|-----------|------------|
| 1 | Scaffold Project | Foundation | — |
| 2 | Database Schema | Foundation | 1 |
| 3 | Seed Cinema Data | Foundation | 2 |
| 4 | Auth Flow | Foundation | 1, 2 |
| 5 | Onboarding Flow | Foundation | 4, 3 |
| 6 | TMDB Service | Screening Flow | 1 |
| 7 | Create Screening | Screening Flow | 6, 3, 5 |
| 8 | Screening Feed | Screening Flow | 7 |
| 9 | Screening Detail + Join | Screening Flow | 8 |
| 10 | Profile Page | Profiles | 5 |
| 11 | Letterboxd RSS Import | Profiles | 10 |
| 12 | "Would Go Again" | Crews | 9 |
| 13 | Crew Formation | Crews | 12 |
| 14 | Crew Features | Crews | 13 |
| 15 | App Layout & Nav | PWA | 8 |
| 16 | PWA Setup | PWA | 15 |
| 17 | Landing Page | PWA | 1 |
