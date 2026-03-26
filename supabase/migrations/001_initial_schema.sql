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

-- Many-to-many: user preferred cinemas
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
  datetime timestamptz,
  after_spot text,
  organizer_id uuid references profiles(id) not null,
  cap int not null default 6 check (cap >= 2 and cap <= 20),
  crew_id uuid references crews(id),
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
alter table cinemas enable row level security;
alter table profile_cinemas enable row level security;

-- Profiles: public read, own write
create policy "Profiles are publicly readable" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Screenings: public read, organizer write
create policy "Screenings are publicly readable" on screenings for select using (
  crew_id is null or exists (select 1 from crew_members where crew_id = screenings.crew_id and profile_id = auth.uid())
);
create policy "Authenticated users can create screenings" on screenings for insert with check (auth.uid() = organizer_id);
create policy "Organizers can update own screenings" on screenings for update using (auth.uid() = organizer_id);

-- Attendees
create policy "Attendees are publicly readable" on screening_attendees for select using (true);
create policy "Users can join screenings" on screening_attendees for insert with check (auth.uid() = profile_id);
create policy "Users can leave screenings" on screening_attendees for delete using (auth.uid() = profile_id);

-- Crews: members only
create policy "Crew members can read crew" on crews for select using (
  exists (select 1 from crew_members where crew_id = crews.id and profile_id = auth.uid())
);
create policy "Authenticated users can create crews" on crews for insert with check (true);

create policy "Crew members can read members" on crew_members for select using (
  exists (select 1 from crew_members cm where cm.crew_id = crew_members.crew_id and cm.profile_id = auth.uid())
);
create policy "Crew members can insert members" on crew_members for insert with check (auth.uid() = profile_id);

-- Cinemas: public read
create policy "Cinemas are publicly readable" on cinemas for select using (true);

-- Profile cinemas
create policy "Profile cinemas publicly readable" on profile_cinemas for select using (true);
create policy "Users manage own cinema prefs" on profile_cinemas for insert with check (auth.uid() = profile_id);
create policy "Users delete own cinema prefs" on profile_cinemas for delete using (auth.uid() = profile_id);

-- Would go again
create policy "Users can insert own would_go_again" on would_go_again for insert with check (auth.uid() = from_user_id);
create policy "Users can read own would_go_again" on would_go_again for select using (auth.uid() = from_user_id or auth.uid() = to_user_id);

-- Film votes
create policy "Crew members can read votes" on crew_film_votes for select using (
  exists (select 1 from crew_members where crew_id = crew_film_votes.crew_id and profile_id = auth.uid())
);
create policy "Crew members can propose films" on crew_film_votes for insert with check (
  exists (select 1 from crew_members where crew_id = crew_film_votes.crew_id and profile_id = auth.uid())
);

create policy "Crew members can vote" on crew_film_vote_ballots for insert with check (auth.uid() = profile_id);
create policy "Crew members can read ballots" on crew_film_vote_ballots for select using (
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
