import Link from "next/link";
import Image from "next/image";

const darkBg = "#1a1510";
const darkerBg = "#12100c";
const amber = "#f59e0b";
const amberDark = "#451a03";
const amberLight = "#fef3c7";
const amberMid = "#b45309";
const warmCream = "#fefaf0";
const stone900 = "#1c1917";
const stone500 = "#78716c";
const stone400 = "#a8a29e";
const amberShadow = "0 10px 25px -5px rgba(245,158,11,0.3)";
const imgShadow = "0 20px 60px -15px rgba(0,0,0,0.2)";

const overlay: React.CSSProperties = {
  position: "absolute",
  top: 0, left: 0, right: 0, bottom: 0,
};

const ctaStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 56,
  padding: "0 40px",
  borderRadius: 12,
  backgroundColor: amber,
  color: amberDark,
  fontWeight: 600,
  fontSize: 16,
  boxShadow: amberShadow,
  transition: "all 0.2s",
  textDecoration: "none",
};

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{ position: "relative", minHeight: "90vh", display: "flex", alignItems: "flex-end", backgroundColor: darkBg, overflow: "hidden" }}>
        <div style={overlay}>
          <Image src="/images/hero-friends.png" alt="Friends laughing at a Brooklyn bar" fill style={{ objectFit: "cover", opacity: 0.4 }} priority sizes="100vw" />
          <div style={{ ...overlay, background: `linear-gradient(to bottom, ${darkBg}cc 0%, transparent 40%, ${darkBg}f2 100%)` }} />
        </div>

        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", width: "100%", padding: "128px 24px 96px" }}>
          <p style={{ fontSize: 13, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.25em", color: "rgba(251,191,36,0.8)" }}>
            For NYC cinephiles
          </p>
          <h1 style={{ marginTop: 24, maxWidth: 800, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.02em", color: "#fff" }}>
            Movies are better when you have someone to talk about them with
          </h1>
          <p style={{ marginTop: 32, maxWidth: 540, fontSize: 18, lineHeight: 1.7, color: "rgba(255,255,255,0.6)" }}>
            Find 3-5 people who love the same films you do. Watch together at your favorite NYC cinemas. Grab a beer after and talk about what you just saw. That&apos;s it.
          </p>
          <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
            <Link href="/login" style={ctaStyle}>Find your crew</Link>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Free. No app to download.</span>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section style={{ padding: "96px 24px", backgroundColor: warmCream }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <blockquote style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)", fontWeight: 500, fontStyle: "italic", lineHeight: 1.7, color: stone900 }}>
            &ldquo;I don&apos;t need a huge friend group. I just want a few people who want to grab a beer after a screening and talk about what we just watched.&rdquo;
          </blockquote>
          <p style={{ marginTop: 24, fontSize: 14, color: stone400 }}>
            &mdash; A real post. 194 upvotes. 100+ people who felt the same.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "96px 24px", backgroundColor: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.25em", color: stone400 }}>
            How it works
          </h2>

          <Step
            num="1"
            title="Browse what's showing"
            desc="See real screenings at Nitehawk, BAM, Alamo Drafthouse, and every indie cinema in NYC. Someone already picked the film and the showtime. You just show up."
            img="/images/step-browse.png"
            alt="Browsing movie screenings"
            reverse={false}
          />
          <Step
            num="2"
            title="Join a small group"
            desc="Groups are capped at 6 people by design. No awkward Meetup crowds of 25 people standing outside a theater. Just a few people who actually want to be there."
            img="/images/step-join.png"
            alt="Small group at the movies"
            reverse
          />
          <Step
            num="3"
            title="Find your people"
            desc="After 2-3 screenings, you'll notice the same faces. The ones who get your taste. The ones who stay for the conversation. That's your crew. It happens naturally."
            img="/images/step-crew.png"
            alt="Friends discussing a movie at a bar"
            reverse={false}
          />
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: "relative", overflow: "hidden", backgroundColor: darkBg, padding: "128px 24px" }}>
        <div style={overlay}>
          <Image src="/images/hero-friends.png" alt="" fill style={{ objectFit: "cover", opacity: 0.15 }} sizes="100vw" />
        </div>
        <div style={{ position: "relative", maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.15, color: "#fff" }}>
            The movie is almost secondary sometimes
          </h2>
          <p style={{ marginTop: 32, fontSize: 18, lineHeight: 1.7, color: "rgba(255,255,255,0.6)" }}>
            It&apos;s the conversation after that matters. The debate over whether the ending worked. The recommendation you never would have found on your own. The regulars who become friends.
          </p>
          <div style={{ marginTop: 40 }}>
            <Link href="/login" style={ctaStyle}>Join Movie Club</Link>
          </div>
          <p style={{ marginTop: 20, fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
            Brooklyn, Manhattan, Queens. More neighborhoods coming.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "40px 24px", backgroundColor: darkerBg }}>
        <p style={{ textAlign: "center", fontSize: 14, color: "rgba(255,255,255,0.25)" }}>
          Movie Club &mdash; NYC
        </p>
      </footer>
    </div>
  );
}

function Step({ num, title, desc, img, alt, reverse }: {
  num: string; title: string; desc: string; img: string; alt: string; reverse: boolean;
}) {
  const imageBlock = (
    <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 16, overflow: "hidden", boxShadow: imgShadow }}>
      <Image src={img} alt={alt} fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 100vw, 50vw" />
    </div>
  );
  const textBlock = (
    <div>
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: 36, width: 36, borderRadius: "50%", backgroundColor: amberLight, color: amberMid, fontSize: 14, fontWeight: 700 }}>
        {num}
      </span>
      <h3 style={{ marginTop: 16, fontSize: 24, fontWeight: 700, color: stone900 }}>{title}</h3>
      <p style={{ marginTop: 12, fontSize: 16, lineHeight: 1.7, color: stone500 }}>{desc}</p>
    </div>
  );

  return (
    <div style={{ marginTop: 80, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, alignItems: "center" }}>
      {reverse ? <>{textBlock}{imageBlock}</> : <>{imageBlock}{textBlock}</>}
    </div>
  );
}
