import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import { AUTHOR_FIELDS, type Author } from "@/lib/types";

type LandingThread = {
  id: number;
  title: string;
  author: Author | null;
  category: { name: string; tint: string; ink: string } | null;
};

const ARROW = "M5 12h14M13 6l6 6-6 6";
const CHECK = "M5 12l5 5L20 7";

/** "Start where you are": three stages, each pointing at the forum categories that fit it. */
const PATHS = [
  {
    who: "I am exploring",
    title: "Learn the basics and pick a market",
    bg: "#F5F6FA",
    ink: "#1D4ED8",
    links: [
      { cat: "start", name: "Getting Started" },
      { cat: "feas", name: "Market Research" },
    ],
  },
  {
    who: "I am buying or building",
    title: "Check a deal before you sign",
    bg: "#FFF8F3",
    ink: "#B5440A",
    links: [
      { cat: "acq", name: "Buying a Facility" },
      { cat: "dev", name: "Building New" },
      { cat: "conv", name: "Conversions" },
    ],
  },
  {
    who: "I am running a facility",
    title: "Fill units and raise rents",
    bg: "#F5FBF8",
    ink: "#17603F",
    links: [
      { cat: "ops", name: "Running a Facility" },
      { cat: "rev", name: "Pricing & Rents" },
      { cat: "mkt", name: "Marketing" },
    ],
  },
];

const FAQ = [
  { q: "Is it really free?", a: "Yes. Joining, reading and posting in the forums is free. No credit card." },
  { q: "Who answers the questions?", a: "Members who own, run, build or lend on storage facilities. Verified members get an orange check next to their name." },
  { q: "When does the Deal Room open?", a: "We are building it now. Members hear first when it opens." },
];

/** The home page for visitors who are not logged in: hero, paths by stage, recent forum questions, FAQ and a closing call to join. */
export async function Landing() {
  const supabase = await createClient();
  const threadsRes = await supabase
    .from("threads")
    .select(`id, title, author:profiles!threads_author_id_fkey(${AUTHOR_FIELDS}), category:categories(name, tint, ink)`)
    .order("last_activity_at", { ascending: false })
    .limit(3);
  const threads = (threadsRes.data ?? []) as unknown as LandingThread[];

  return (
    <div className="l-page">
      <div className="l-bar">
        <header className="l-in l-head">
          <Logo />
          <nav className="l-nav" aria-label="Main">
            <Link href="/forums">Forums</Link>
            <Link href="/tools">Tools</Link>
            <Link href="/learn">Learn</Link>
            <Link href="/deals">Deal Room</Link>
          </nav>
          <div className="l-head-end">
            <Link className="l-login" href="/login">
              Log in
            </Link>
            <Link className="l-btn sm" href="/signup">
              Join free
            </Link>
          </div>
        </header>
      </div>

      <main>
        <section className="l-in l-hero">
          <div className="l-hero-copy">
            <span className="l-kicker l-in-up">The self storage community</span>
            <h1 className="l-h1 l-in-up l-d1">Learn self storage from the people who already own it</h1>
            <p className="l-lead l-in-up l-d2">Ask questions in the forums and run the numbers with free tools. Owners, operators and lenders answer.</p>
            <SignupForm id="hero-email" className="l-in-up l-d3" />
            <ul className="l-checks l-in-up l-d4">
              {["Free to join", "No credit card", "Real owners answer"].map((t) => (
                <li key={t}>
                  <Icon d={CHECK} size={16} strokeWidth={2.6} stroke="#16855A" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="l-hero-art l-in-up l-d2">
            <Image
              src="/landing/storage-facility.jpg"
              alt="A modern self storage facility with rows of orange roll-up doors"
              width={1600}
              height={686}
              sizes="(max-width: 980px) 100vw, 680px"
              priority
              unoptimized
            />
          </div>
        </section>

        <section className="l-in l-sec">
          <div className="l-sec-head center l-sv">
            <div>
              <div className="l-eyebrow">Start where you are</div>
              <h2 className="l-h2">Whatever stage you are at, someone here has been there</h2>
            </div>
          </div>
          <div className="l-paths">
            {PATHS.map((path, i) => (
              <div key={path.who} className={`l-path l-sv${i ? ` l-sv${i + 1}` : ""}`} style={{ background: path.bg }}>
                <span className="l-path-who" style={{ color: path.ink }}>
                  {path.who}
                </span>
                <h3>{path.title}</h3>
                <div className="l-path-links">
                  {path.links.map((l) => (
                    <Link key={l.cat} href={`/forums?cat=${l.cat}`} className="l-nudge">
                      {l.name} <Icon d={ARROW} size={14} strokeWidth={2.4} />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="l-in l-forum">
          <div className="l-forum-copy l-sv">
            <div className="l-eyebrow">From the forums</div>
            <h2 className="l-h2">Real questions. Answers from people who have done it.</h2>
            <p>No sales pitches. Members share what they paid, what went wrong and what they would do again.</p>
            <Link href="/forums" className="l-btn sm navy">
              Browse the forums
            </Link>
          </div>
          <div className="l-forum-list">
            {threads.slice(0, 3).map((t, i) => (
              <Link key={t.id} href={`/forums/${t.id}`} className={`l-q l-lift l-svl${i ? ` l-svl${i + 1}` : ""}`}>
                <span className="l-q-who">
                  <Avatar name={t.author?.full_name ?? "?"} color={t.author?.avatar_color ?? "#E6EBF3"} size={30} radius={15} fontSize={11} />
                  <span>
                    <b>{t.author?.full_name ?? "Member"}</b>
                    {t.author?.headline ? ` · ${t.author.headline}` : ""}
                  </span>
                  {t.category && (
                    <span className="l-pill" style={{ background: t.category.tint, color: t.category.ink }}>
                      {t.category.name}
                    </span>
                  )}
                </span>
                <b className="l-q-title">{t.title}</b>
              </Link>
            ))}
          </div>
        </section>

        <section className="l-faq">
          <div className="l-faq-in">
            <h2 className="l-h2 l-sv">Questions before you join</h2>
            {FAQ.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="l-in" style={{ paddingTop: 96, paddingBottom: 96 }}>
          <div className="l-cta">
            <h2 className="l-sv">
              Your next facility starts with a <span style={{ color: "#F26B1D" }}>conversation</span>
            </h2>
            <p className="l-sv l-sv2">Join the investors, operators, developers and lenders who talk self storage here every day.</p>
            <SignupForm id="closing-email" className="l-sv l-sv3" />
            <div className="l-note">Free to join. No credit card.</div>
            <Town />
          </div>
        </section>
      </main>

      <footer className="l-foot">
        <div className="l-in l-foot-in">
          <Logo />
          <nav aria-label="Footer">
            <Link href="/forums">Forums</Link>
            <Link href="/tools">Tools</Link>
            <Link href="/learn">Learn</Link>
            <Link href="/deals">Deal Room</Link>
            <Link href="/guidelines">Guidelines</Link>
          </nav>
          <span style={{ fontSize: 13, color: "#5E6B7E" }}>© {new Date().getFullYear()} The Storage Network</span>
        </div>
      </footer>
    </div>
  );
}

/** Email box that carries the address over to the signup form. */
function SignupForm({ id, className }: { id: string; className: string }) {
  return (
    <form action="/signup" method="get" className={`l-signup ${className}`}>
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <input id={id} name="email" type="email" placeholder="you@example.com" autoComplete="email" />
      <button type="submit" className="l-btn">
        Join free
      </button>
    </form>
  );
}

/** The row of storage buildings at the foot of the closing panel. */
function Town() {
  const side = (edge: "left" | "right") => (
    <div className="l-town-side l-rise l-rise2">
      <div style={{ [edge]: 0, width: "24%", bottom: 0, height: 104, background: "#F5F6FA", borderRadius: "8px 8px 0 0" }} />
      <div style={{ [edge]: -6, width: "calc(24% + 12px)", bottom: 104, height: 12, background: "#C5D1E3", borderRadius: 5 }} />
      <div
        style={{ [edge]: 16, width: "calc(24% - 32px)", bottom: 0, height: 70, background: "repeating-linear-gradient(90deg, #16305A 0 48px, transparent 48px 62px)" }}
      />
    </div>
  );
  return (
    <div className="l-town" role="img" aria-label="A row of self storage buildings with orange roll-up doors">
      {side("left")}
      <div className="l-rise">
        <div style={{ left: "27%", width: "46%", bottom: 0, height: 150, background: "#fff", borderRadius: "10px 10px 0 0" }} />
        <div style={{ left: "calc(27% - 10px)", width: "calc(46% + 20px)", bottom: 150, height: 16, background: "#C5D1E3", borderRadius: 6 }} />
        <div
          style={{ left: "calc(27% + 22px)", width: "calc(46% - 44px)", bottom: 0, height: 104, background: "repeating-linear-gradient(90deg, #DB520B 0 60px, transparent 60px 76px)" }}
        />
        <div className="l-slats" style={{ left: "calc(27% + 22px)", width: "calc(46% - 44px)", bottom: 0, height: 104 }} />
        <div style={{ left: "calc(27% + 174px)", bottom: 0, width: 60, height: 104, background: "#F26B1D" }} />
        <div className="l-roll" style={{ left: "calc(27% + 174px)", bottom: 0, width: 60, height: 46, background: "#0B1F3A" }} />
      </div>
      {side("right")}
    </div>
  );
}
