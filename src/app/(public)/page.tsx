import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero — full bleed dark cinema */}
      <section className="relative min-h-[90vh] flex items-end bg-cinema-dark overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-friends.png"
            alt="Friends laughing together at a Brooklyn bar after a movie"
            fill
            className="object-cover opacity-40"
            priority
            sizes="100vw"
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, rgba(26,21,16,0.6) 0%, transparent 40%, rgba(26,21,16,0.95) 100%)",
            }}
          />
        </div>

        <div className="relative mx-auto w-full max-w-5xl px-6 pb-24 pt-32 sm:pb-32">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-amber-400/80">
            For NYC cinephiles
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Movies are better when you have someone to talk about them with
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/60">
            Find 3-5 people who love the same films you do. Watch together at
            your favorite NYC cinemas. Grab a beer after and talk about what
            you just saw. That&apos;s it.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/login"
              className="inline-flex h-14 items-center justify-center rounded-xl bg-amber-500 px-10 text-base font-semibold text-amber-950 transition-all hover:bg-amber-400 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              Find your crew
            </Link>
            <span className="text-sm text-white/40">
              Free. No app to download.
            </span>
          </div>
        </div>
      </section>

      {/* Social proof — emotional quote */}
      <section className="px-6 py-24 bg-amber-50/50">
        <div className="mx-auto max-w-3xl text-center">
          <blockquote className="text-xl font-medium italic leading-relaxed text-stone-800 sm:text-2xl">
            &ldquo;I don&apos;t need a huge friend group. I just want a few
            people who want to grab a beer after a screening and talk about
            what we just watched.&rdquo;
          </blockquote>
          <p className="mt-6 text-sm text-stone-500">
            &mdash; A real post. 194 upvotes. 100+ people who felt the same.
          </p>
        </div>
      </section>

      {/* How it works — alternating image + text */}
      <section className="px-6 py-24 bg-white">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-stone-400">
            How it works
          </h2>

          {/* Step 1 */}
          <div className="mt-20 grid items-center gap-10 md:grid-cols-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-xl">
              <Image
                src="/images/step-browse.png"
                alt="Browsing movie screenings"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                1
              </span>
              <h3 className="mt-4 text-2xl font-bold text-stone-900">
                Browse what&apos;s showing
              </h3>
              <p className="mt-3 text-base leading-relaxed text-stone-500">
                See real screenings at Nitehawk, BAM, Alamo Drafthouse, and
                every indie cinema in NYC. Someone already picked the film
                and the showtime. You just show up.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mt-24 grid items-center gap-10 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                2
              </span>
              <h3 className="mt-4 text-2xl font-bold text-stone-900">
                Join a small group
              </h3>
              <p className="mt-3 text-base leading-relaxed text-stone-500">
                Groups are capped at 6 people by design. No awkward Meetup
                crowds of 25 people standing outside a theater. Just a few
                people who actually want to be there.
              </p>
            </div>
            <div className="relative order-1 aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-xl md:order-2">
              <Image
                src="/images/step-join.png"
                alt="Small group at the movies"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Step 3 */}
          <div className="mt-24 grid items-center gap-10 md:grid-cols-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-xl">
              <Image
                src="/images/step-crew.png"
                alt="Friends discussing a movie at a bar"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                3
              </span>
              <h3 className="mt-4 text-2xl font-bold text-stone-900">
                Find your people
              </h3>
              <p className="mt-3 text-base leading-relaxed text-stone-500">
                After 2-3 screenings, you&apos;ll notice the same faces.
                The ones who get your taste. The ones who stay for the
                conversation. That&apos;s your crew. It happens naturally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Emotional CTA */}
      <section className="relative overflow-hidden bg-cinema-dark px-6 py-32">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-friends.png"
            alt=""
            fill
            className="object-cover opacity-15"
            sizes="100vw"
          />
        </div>
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight">
            The movie is almost secondary sometimes
          </h2>
          <p className="mt-8 text-lg leading-relaxed text-white/60">
            It&apos;s the conversation after that matters. The debate over
            whether the ending worked. The recommendation you never would have
            found on your own. The regulars who become friends.
          </p>
          <Link
            href="/login"
            className="mt-10 inline-flex h-14 items-center justify-center rounded-xl bg-amber-500 px-10 text-base font-semibold text-amber-950 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 active:translate-y-0"
          >
            Join Movie Club
          </Link>
          <p className="mt-5 text-sm text-white/30">
            Brooklyn, Manhattan, Queens. More neighborhoods coming.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cinema-darker px-6 py-10">
        <p className="text-center text-sm text-white/25">
          Movie Club &mdash; NYC
        </p>
      </footer>
    </div>
  );
}
