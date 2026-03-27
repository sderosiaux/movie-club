# Movie Club

**Find your movie crew in NYC.**

You know the feeling. You walk out of a great film and you want to *talk* about it. The ending. That one scene. Whether it lived up to the hype. But your friends aren't into movies like you are, or they're busy, or they moved away.

Movie Club fixes that. Small groups of 3-6 people. Real cinemas. A beer after. The movie is almost secondary — it's the conversation that matters.

[**See the landing page**](https://sderosiaux.github.io/movie-club/)

---

## What this is

A web app for NYC cinephiles to:

- **Browse screenings** at Nitehawk, BAM, Alamo Drafthouse, and every indie cinema in the city
- **Join small groups** — capped at 6 people, no awkward Meetup crowds
- **Form crews** — after 2-3 screenings, the app notices the same faces and helps you make it a regular thing
- **Keep it going** — one-tap "same time next week?", film voting, turn rotation so no one burns out organizing

## How it works

1. Sign up with your email
2. Pick your neighborhood, favorite cinemas, genres
3. Browse upcoming screenings or propose your own
4. Show up. Watch. Stay for the conversation.
5. After a few screenings, you'll find your people

The "Would Go Again" feature lets you quietly signal who you'd hang out with again. When it's mutual, Movie Club suggests forming a crew. No awkward asks. It happens naturally.

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **SQLite** via Drizzle ORM + better-sqlite3
- **Auth.js v5** (email-only credentials for dev)
- **TMDB API** for film data
- **Tailwind CSS 4** + shadcn/ui
- **Letterboxd RSS** import

## Getting started

```bash
# Install
npm install

# Set up the database
npm run db:push
npm run db:seed    # seeds 14 NYC cinemas

# Create .env.local
echo "AUTH_SECRET=$(openssl rand -base64 32)" > .env.local
echo "TMDB_API_KEY=your-key-here" >> .env.local

# Run
npm run dev
```

Open [localhost:3000](http://localhost:3000). Enter any email to sign in (dev mode — no password needed).

## The origin story

This started from a [Reddit post](https://www.reddit.com/r/nycmeetups/) that got 194 upvotes:

> *"I don't need a huge friend group. I just want a few people who want to grab a beer after a screening and talk about what we just watched."*

100+ people felt the same way. Movie Club is for them.

## License

MIT
