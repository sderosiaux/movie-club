# Movie Club — Product Spec v2.1

## The Real Problem

Urban loneliness disguised as "I just want someone to talk about the movie with after."
Movies are the socially acceptable excuse. The post-movie beer is the real product.

194 upvotes, 100+ comments, dozens of "can I join?" — nobody said "I want to organize."
Everyone wants to *belong*. Nobody wants to *run* it.

## Positioning

A crew formation tool for NYC cinephiles. Not Meetup (too big), not Letterboxd (no IRL), not a dating app.

**What it does:** Forms small, persistent crews of movie people in your neighborhood. The crew watches films together and talks about them after. The app gets out of the way once the crew is formed.

**What it doesn't do:** Run a social network, host reviews, replace Letterboxd, scale to thousands.

**Differentiator:** Intentional smallness. Crews of 3-6 people. Not events for strangers — relationships for regulars.

---

## Two-Phase Product Life

The product has two distinct phases. Both must deliver value independently.

### Phase 1: The Feed (weeks 1-4)

No crews exist yet. Not enough repeat co-attendance for organic crew formation. The product IS the screening feed — and it must be good enough standalone.

- A single good screening with strangers must be enough to retain the user
- The onboarding sets expectations: "Find your crew in 2-3 screenings"
- The feed is the product. Not a stepping stone, not a waiting room.
- Founders bootstrap 5+ screenings/week to ensure the feed is never empty

### Phase 2: Crews Emerge (after critical mass)

After enough screenings, the same people start showing up together. The app detects this and prompts crew formation. Now the product shifts from discovery to ritual.

Transition signals:
- 3+ screenings with 2+ overlapping attendees → crew prompt
- A user manually invites people they met at screenings → crew

The feed never goes away — it remains the discovery layer for new crew members, second crews, or solo screenings.

---

## Core Concepts

### The Crew (primitive #1)

A persistent small group (3-6 members) that watches movies together regularly.

- Formed organically through shared screenings, or by direct invite
- Has a shared history: films seen together, bars visited, streak count
- Members see each other's Letterboxd activity (with consent)
- No leader/admin — the crew is peer-to-peer
- A user can belong to multiple crews

The crew is what makes this not-Eventbrite. It's the relationship container.

### The Screening (primitive #2)

Someone proposes: film + cinema + date/time + optional bar after.

- Open to the public feed OR crew-only
- Soft cap set by organizer (default 6), waitlist beyond
- Film data from TMDB (poster, synopsis, genres, rating)
- Cinema from curated NYC list
- After-spot: free text field ("drinks at Marian's after")

### The Graduation

When a crew clicks, they'll move to iMessage/WhatsApp. This is success, not failure.

Design for it:
- **One-tap WhatsApp group creation** — when a crew forms, the app generates a WhatsApp invite link pre-filled with all members. One button: "Start your crew group chat." No manual number exchange, no friction.
- Crew history exportable (films watched, dates, bars)
- The app remains the *discovery* layer: "I want a second crew" or "someone left, find a replacement"
- Metric: crews formed, not DAU

---

## User Types

### The Joiner (95%)

The Reddit OP. Wants to belong. Will not organize. Needs:
- Browse screenings near me this week
- See who's going (photo, neighborhood, taste overlap from Letterboxd)
- One-tap join
- Get reminded day-of
- After 2-3 screenings with same people → prompt to form a crew

### The Organizer (5%)

u/blwthewaterline from the thread. Already runs a movie club IRL. Needs:
- Fast screening creation (pick film from TMDB, pick cinema, pick time, done)
- See who joined, manage waitlist
- Track which films the crew has seen (no repeats)
- Zero admin overhead — the app handles reminders, RSVPs, no-show tracking

### Making Organizers

The supply problem. Solutions baked into the product:
- **Rotation suggestion:** "It's Sarah's turn to pick the film" — distributes the organizing load
- **One-tap repost:** "Same crew, same cinema, next Friday?" — recurring screenings with zero effort
- **Film voting → draft screening:** Crew members suggest films and vote. The winner creates a *draft* screening (film pre-filled) that the turn's organizer completes with cinema + time found manually on the cinema's website. Honest about what we can automate (film pick) vs. what we can't (real showtimes).
- **Smart suggestions:** "Moonlight is showing at BAM this week" — the app surfaces TMDB upcoming releases matched to crew taste. The organizer checks the cinema site for the actual showtime and completes the screening.

---

## User Flow

### Onboarding (under 2 minutes)

1. Magic link login (email) or Apple/Google OAuth
2. First name, photo, neighborhood (dropdown of NYC neighborhoods)
3. Pick your cinemas (grid of NYC cinema logos, multi-select)
4. Connect Letterboxd (optional but encouraged — imports watchlist, favorites, ratings)
5. Pick 3+ favorite genres
6. **"Find your crew in 2-3 screenings"** — sets the expectation that this is a journey, not instant matching
7. Land on the feed

No bio to write. No films to rate. Profile richness comes from Letterboxd import and usage over time.

### Finding a Screening

Public feed, filterable:
- By date (tonight, this week, this weekend)
- By borough/neighborhood
- By cinema
- By genre

Each screening card shows:
- Film poster + title + TMDB rating
- Cinema + time
- Organizer photo + name
- Attendees (photos) + spots remaining
- Taste overlap score (from Letterboxd data, if connected)
- After-spot if set

### Joining

- Tap "Join" → confirmed if under cap
- Over cap → waitlist with position
- Day-of reminder (push notification)
- Post-screening: "Who would you go with again?" — select people, not scores. Avoids the social pressure of numeric ratings. Mutual "would go again" signals feed crew formation prompts.

### Crew Formation

After 2-3 screenings with overlapping people, the app prompts:
> "You've seen 3 films with Alex, Jordan, and Sam. Want to start a crew?"

Crew gets:
- Shared screening history
- Film voting → draft screening (organizer completes with time/cinema)
- Turn rotation for organizing
- "Same time next week?" one-tap recurring
- One-tap "Create WhatsApp group" with pre-filled invite link

---

## Trust & Safety

The thread shows strangers meeting IRL. Safety is non-negotiable.

- **Letterboxd link as soft verification** — real cinephile signal, harder to fake
- **Mutual "would go again" signals** — replaces numeric hangout ratings (which suffer from social pressure). Pattern of never being selected = soft signal for review
- **Report/block** — standard, per-user
- **Organizer can remove attendees** before the screening
- **No DMs in v1** — all coordination happens in the screening thread or crew chat. Prevents creepy 1:1 messaging
- **Public profiles only** — no hidden/anonymous accounts

---

## Data Model (simplified)

```
User
  - name, photo, neighborhood, cinemas[], genres[], letterboxd_url
  - letterboxd_data (imported: watchlist, favorites, ratings)

Crew
  - members[] (3-6)
  - screenings_history[]
  - film_votes[]
  - turn_rotation_index

Screening
  - film (TMDB ref: id, title, poster, genres, rating)
  - cinema (from curated list)
  - datetime (nullable — null = draft, waiting for organizer to fill)
  - after_spot (free text)
  - organizer (User ref)
  - cap (default 6)
  - attendees[]
  - waitlist[]
  - crew_id (nullable — null = public)
  - status: draft | upcoming | completed | cancelled

WouldGoAgain
  - screening_id
  - from_user_id
  - to_user_id
  - created_at
```

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | Next.js 15 (App Router) | PWA support, SSR for feed SEO, React Server Components |
| Styling | Tailwind + shadcn/ui | Fast, consistent, light theme |
| Database | Postgres (Supabase) | Free tier sufficient for MVP, row-level security, realtime subscriptions |
| Auth | Supabase Auth | Magic link + OAuth, zero custom auth code |
| Film data | TMDB API | Free, exhaustive, poster/synopsis/genres/rating |
| Letterboxd | RSS feed import (public) | No API needed — Letterboxd exposes RSS for public profiles. Avoids scraping. |
| Hosting | Vercel | Free tier, Next.js native |
| Notifications | Web Push (PWA) | Good enough for MVP. Fallback: email digest |

### Letterboxd Integration (revised)

No scraping. Letterboxd exposes public RSS feeds at `letterboxd.com/{username}/rss/`. Parse:
- Recent diary entries (films watched + ratings)
- Watchlist
- Favorite films (from profile page, one-time import)

Limitations: RSS doesn't include full favorites or lists. Acceptable for MVP — the diary and watchlist give enough signal for taste matching.

---

## Cinema List (curated, v1)

Brooklyn: Nitehawk (Williamsburg + Prospect Park), BAM Rose Cinemas, Alamo Drafthouse, Regal UA Court Street, Syndicated
Manhattan: Angelika, IFC Center, Film Forum, Metrograph, AMC Lincoln Square, Regal Essex, Village East
Queens: Museum of the Moving Image
Bronx/Staten Island: later

~15 cinemas to start. Users can request additions.

---

## Cold Start Strategy

The #1 risk. Mitigations:

1. **Seed with real screenings.** The founders create 3-5 real screenings per week for the first month. Show up. Be the organizer. This is not fake — it's bootstrapping.
2. **Reddit launch.** The post has 194 upvotes. Cross-post to r/Brooklyn, r/bedstuy, r/nycmovies, r/AMCsAlist. The audience is there, waiting.
3. **Cinema partnerships.** A QR code on the ticket or a flyer at the bar. "Find your movie crew." Nitehawk and Alamo have community-oriented audiences.
4. **Letterboxd connection as viral loop.** "Sarah from Bed-Stuy has 47 films in common with you" — shareable stat.

---

## Success Metrics

Not DAU. Not MAU. Not screen time.

| Metric | What it measures | Target (month 3) |
|--------|-----------------|-------------------|
| Crews formed | Core value delivered | 15 active crews |
| Repeat attendance | People coming back | 60% attend 2+ screenings |
| Screening fill rate | Supply/demand balance | 70% of screenings reach 3+ attendees |
| Crew graduation rate | Healthy handoff | 30% of crews create a WhatsApp/iMessage group |
| Organizer retention | Supply-side health | 50% of organizers create 3+ screenings |

---

## What's NOT in v1

- DMs between users
- In-app chat (crew coordination happens via external group chats)
- Film reviews/ratings (Letterboxd does this)
- Algorithmic feed ranking
- Multiple cities
- Native mobile app
- Payment/ticketing integration
- Calendar sync
