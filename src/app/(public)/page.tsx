import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="max-w-2xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          Find your movie crew in NYC
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground sm:text-xl">
          Small groups. Real conversations. After the credits.
        </p>
        <Link
          href="/login"
          className="mt-10 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Join Movie Club
        </Link>
      </main>

      {/* How it works */}
      <section className="border-t border-border bg-muted/40 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            How it works
          </h2>
          <div className="mt-16 grid gap-16 sm:grid-cols-3 sm:gap-8">
            <Step
              number="01"
              title="Browse screenings"
              description="See what's showing at your favorite NYC cinemas this week."
            />
            <Step
              number="02"
              title="Join a group"
              description="Small groups of 3-6 people. No awkward Meetup crowds."
            />
            <Step
              number="03"
              title="Form your crew"
              description="After a few screenings, you'll find your people. Then it's ritual."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <p className="text-center text-sm text-muted-foreground">
          Movie Club &mdash; NYC
        </p>
      </footer>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
      <span className="text-xs font-medium tracking-widest text-muted-foreground">
        {number}
      </span>
      <h3 className="mt-3 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
