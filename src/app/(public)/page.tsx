import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero — full bleed with image */}
      <section className="relative overflow-hidden bg-[oklch(0.15_0.02_60)]">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-friends.png"
            alt=""
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.15_0.02_60)]/60 via-transparent to-[oklch(0.15_0.02_60)]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-32 sm:pb-32 sm:pt-44">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-300/80">
            For NYC cinephiles
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Movies are better when you have someone to talk about them with
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/70">
            Find 3-5 people who love the same films you do. Watch together at
            your favorite NYC cinemas. Grab a beer after and talk about what
            you just saw. That&apos;s it.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/login"
              className="inline-flex h-13 items-center justify-center rounded-xl bg-amber-500 px-8 text-base font-semibold text-[oklch(0.15_0.02_60)] shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5"
            >
              Find your crew
            </Link>
            <span className="text-sm text-white/50">
              Free. No app to download.
            </span>
          </div>
        </div>
      </section>

      {/* Social proof — the emotional hook */}
      <section className="bg-background px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <blockquote className="text-xl font-medium italic leading-relaxed text-foreground sm:text-2xl">
            &ldquo;I don&apos;t need a huge friend group. I just want a few
            people who want to grab a beer after a screening and talk about
            what we just watched.&rdquo;
          </blockquote>
          <p className="mt-6 text-sm text-muted-foreground">
            &mdash; A real post. 194 upvotes. 100+ people who felt the same.
          </p>
        </div>
      </section>

      {/* How it works — with images */}
      <section className="bg-muted/30 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            How it works
          </h2>

          {/* Step 1 */}
          <div className="mt-20 grid items-center gap-10 md:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="/images/step-browse.png"
                alt="Browsing movie screenings"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                1
              </span>
              <h3 className="mt-4 text-2xl font-bold text-foreground">
                Browse what&apos;s showing
              </h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                See real screenings at Nitehawk, BAM, Alamo Drafthouse, and
                every indie cinema in NYC. Someone already picked the film
                and the showtime. You just show up.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mt-20 grid items-center gap-10 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                2
              </span>
              <h3 className="mt-4 text-2xl font-bold text-foreground">
                Join a small group
              </h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Groups are capped at 6 people by design. No awkward Meetup
                crowds of 25 people standing outside a theater. Just a few
                people who actually want to be there.
              </p>
            </div>
            <div className="relative order-1 aspect-[4/3] overflow-hidden rounded-2xl md:order-2">
              <Image
                src="/images/step-join.png"
                alt="Small group at the movies"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Step 3 */}
          <div className="mt-20 grid items-center gap-10 md:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="/images/step-crew.png"
                alt="Friends discussing a movie at a bar"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                3
              </span>
              <h3 className="mt-4 text-2xl font-bold text-foreground">
                Find your people
              </h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                After 2-3 screenings, you&apos;ll notice the same faces.
                The ones who get your taste. The ones who stay for the
                conversation. That&apos;s your crew. It happens naturally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Emotional CTA */}
      <section className="relative overflow-hidden bg-[oklch(0.15_0.02_60)] px-6 py-28">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-friends.png"
            alt=""
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            The movie is almost secondary sometimes
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-white/70">
            It&apos;s the conversation after that matters. The debate over
            whether the ending worked. The recommendation you never would have
            found on your own. The regulars who become friends.
          </p>
          <Link
            href="/login"
            className="mt-10 inline-flex h-13 items-center justify-center rounded-xl bg-amber-500 px-8 text-base font-semibold text-[oklch(0.15_0.02_60)] shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5"
          >
            Join Movie Club
          </Link>
          <p className="mt-4 text-sm text-white/40">
            Brooklyn, Manhattan, Queens. More neighborhoods coming.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[oklch(0.12_0.02_60)] px-6 py-8">
        <p className="text-center text-sm text-white/30">
          Movie Club &mdash; NYC
        </p>
      </footer>
    </div>
  );
}
