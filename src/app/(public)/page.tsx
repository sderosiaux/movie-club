import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero — full bleed dark cinema */}
      <section
        className="relative flex items-end overflow-hidden"
        style={{ minHeight: "90vh", backgroundColor: "#1a1510" }}
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-friends.png"
            alt="Friends laughing together at a Brooklyn bar after a movie"
            fill
            className="object-cover"
            style={{ opacity: 0.4 }}
            priority
            sizes="100vw"
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(26,21,16,0.7) 0%, transparent 40%, rgba(26,21,16,0.95) 100%)",
            }}
          />
        </div>

        <div className="relative mx-auto w-full max-w-5xl px-6 pb-24 pt-32 sm:pb-32">
          <p
            className="text-sm font-medium uppercase"
            style={{ letterSpacing: "0.25em", color: "rgba(251,191,36,0.8)" }}
          >
            For NYC cinephiles
          </p>
          <h1
            className="mt-6 max-w-3xl text-4xl font-bold sm:text-6xl lg:text-7xl"
            style={{ lineHeight: 1.08, letterSpacing: "-0.02em", color: "#ffffff" }}
          >
            Movies are better when you have someone to talk about them with
          </h1>
          <p
            className="mt-8 max-w-xl text-lg"
            style={{ lineHeight: 1.7, color: "rgba(255,255,255,0.6)" }}
          >
            Find 3-5 people who love the same films you do. Watch together at
            your favorite NYC cinemas. Grab a beer after and talk about what
            you just saw. That&apos;s it.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl text-base font-semibold transition-all"
              style={{
                height: 56,
                padding: "0 40px",
                backgroundColor: "#f59e0b",
                color: "#451a03",
                boxShadow: "0 10px 25px -5px rgba(245,158,11,0.3)",
              }}
            >
              Find your crew
            </Link>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Free. No app to download.
            </span>
          </div>
        </div>
      </section>

      {/* Social proof — emotional quote */}
      <section className="px-6 py-24" style={{ backgroundColor: "#fefaf0" }}>
        <div className="mx-auto max-w-3xl text-center">
          <blockquote
            className="text-xl font-medium italic sm:text-2xl"
            style={{ lineHeight: 1.7, color: "#292524" }}
          >
            &ldquo;I don&apos;t need a huge friend group. I just want a few
            people who want to grab a beer after a screening and talk about
            what we just watched.&rdquo;
          </blockquote>
          <p className="mt-6 text-sm" style={{ color: "#a8a29e" }}>
            &mdash; A real post. 194 upvotes. 100+ people who felt the same.
          </p>
        </div>
      </section>

      {/* How it works — alternating image + text */}
      <section className="px-6 py-24" style={{ backgroundColor: "#ffffff" }}>
        <div className="mx-auto max-w-5xl">
          <h2
            className="text-center text-sm font-semibold uppercase"
            style={{ letterSpacing: "0.25em", color: "#a8a29e" }}
          >
            How it works
          </h2>

          {/* Step 1 */}
          <div className="mt-20 grid items-center gap-10 md:grid-cols-2">
            <div
              className="relative w-full overflow-hidden rounded-2xl"
              style={{ aspectRatio: "4/3", boxShadow: "0 20px 60px -15px rgba(0,0,0,0.2)" }}
            >
              <Image
                src="/images/step-browse.png"
                alt="Browsing movie screenings"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div>
              <span
                className="inline-flex items-center justify-center rounded-full text-sm font-bold"
                style={{ height: 36, width: 36, backgroundColor: "#fef3c7", color: "#b45309" }}
              >
                1
              </span>
              <h3 className="mt-4 text-2xl font-bold" style={{ color: "#1c1917" }}>
                Browse what&apos;s showing
              </h3>
              <p className="mt-3 text-base" style={{ lineHeight: 1.7, color: "#78716c" }}>
                See real screenings at Nitehawk, BAM, Alamo Drafthouse, and
                every indie cinema in NYC. Someone already picked the film
                and the showtime. You just show up.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mt-24 grid items-center gap-10 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <span
                className="inline-flex items-center justify-center rounded-full text-sm font-bold"
                style={{ height: 36, width: 36, backgroundColor: "#fef3c7", color: "#b45309" }}
              >
                2
              </span>
              <h3 className="mt-4 text-2xl font-bold" style={{ color: "#1c1917" }}>
                Join a small group
              </h3>
              <p className="mt-3 text-base" style={{ lineHeight: 1.7, color: "#78716c" }}>
                Groups are capped at 6 people by design. No awkward Meetup
                crowds of 25 people standing outside a theater. Just a few
                people who actually want to be there.
              </p>
            </div>
            <div
              className="relative order-1 w-full overflow-hidden rounded-2xl md:order-2"
              style={{ aspectRatio: "4/3", boxShadow: "0 20px 60px -15px rgba(0,0,0,0.2)" }}
            >
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
            <div
              className="relative w-full overflow-hidden rounded-2xl"
              style={{ aspectRatio: "4/3", boxShadow: "0 20px 60px -15px rgba(0,0,0,0.2)" }}
            >
              <Image
                src="/images/step-crew.png"
                alt="Friends discussing a movie at a bar"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div>
              <span
                className="inline-flex items-center justify-center rounded-full text-sm font-bold"
                style={{ height: 36, width: 36, backgroundColor: "#fef3c7", color: "#b45309" }}
              >
                3
              </span>
              <h3 className="mt-4 text-2xl font-bold" style={{ color: "#1c1917" }}>
                Find your people
              </h3>
              <p className="mt-3 text-base" style={{ lineHeight: 1.7, color: "#78716c" }}>
                After 2-3 screenings, you&apos;ll notice the same faces.
                The ones who get your taste. The ones who stay for the
                conversation. That&apos;s your crew. It happens naturally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Emotional CTA */}
      <section
        className="relative overflow-hidden px-6 py-32"
        style={{ backgroundColor: "#1a1510" }}
      >
        <div className="absolute inset-0">
          <Image
            src="/images/hero-friends.png"
            alt=""
            fill
            className="object-cover"
            style={{ opacity: 0.15 }}
            sizes="100vw"
          />
        </div>
        <div className="relative mx-auto max-w-2xl text-center">
          <h2
            className="text-3xl font-bold sm:text-4xl lg:text-5xl"
            style={{ lineHeight: 1.15, color: "#ffffff" }}
          >
            The movie is almost secondary sometimes
          </h2>
          <p
            className="mt-8 text-lg"
            style={{ lineHeight: 1.7, color: "rgba(255,255,255,0.6)" }}
          >
            It&apos;s the conversation after that matters. The debate over
            whether the ending worked. The recommendation you never would have
            found on your own. The regulars who become friends.
          </p>
          <Link
            href="/login"
            className="mt-10 inline-flex items-center justify-center rounded-xl text-base font-semibold transition-all"
            style={{
              height: 56,
              padding: "0 40px",
              backgroundColor: "#f59e0b",
              color: "#451a03",
              boxShadow: "0 10px 25px -5px rgba(245,158,11,0.3)",
            }}
          >
            Join Movie Club
          </Link>
          <p className="mt-5 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            Brooklyn, Manhattan, Queens. More neighborhoods coming.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10" style={{ backgroundColor: "#12100c" }}>
        <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
          Movie Club &mdash; NYC
        </p>
      </footer>
    </div>
  );
}
