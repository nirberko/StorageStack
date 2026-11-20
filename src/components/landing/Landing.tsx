import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { CalculatorScene, ChecklistScene, DealsScene, ForumScene, FundingScene } from "./Scenes";

const CHECK = "M5 12l5 5L20 7";

/** The five problems that stop self storage investors, each with what The Storage Network gives them and a picture of it. */
const PAINS = [
  {
    title: "See deals before they hit the market",
    text: "Most facilities sell off market. The Deal Room shows deals from members and brokers, and alerts you when one comes up in your area.",
    product: "Deal Room",
    live: false,
    Scene: DealsScene,
  },
  {
    title: "Meet the people who fund storage",
    text: "Banks want a track record you don’t have yet. Find lenders who already finance storage, and partners with money who need someone to run the deal.",
    product: "Lenders and partners",
    live: false,
    Scene: FundingScene,
  },
  {
    title: "Check the numbers in five minutes",
    text: "Put in the price, income and costs. See the cap rate and price per square foot. Then ask members to check your math.",
    product: "Deal calculators",
    live: false,
    Scene: CalculatorScene,
  },
  {
    title: "Know what to check before you sign",
    text: "Sellers don’t tell you what’s wrong. Follow a checklist from owners who learned the hard way.",
    product: "Due diligence checklist",
    live: false,
    Scene: ChecklistScene,
  },
  {
    title: "Ask the people who already did it",
    text: "Most people give up before their first deal because they have no one to ask. Here, owners, operators and lenders answer. Free, today.",
    product: "Forums",
    live: true,
    Scene: ForumScene,
  },
];

const FAQ = [
  { q: "Is it really free?", a: "Yes. Joining, reading and posting in the forums is free. No credit card." },
  { q: "Who answers the questions?", a: "Members who own, run, build or lend on storage facilities. Verified members get an orange check next to their name." },
  { q: "When does the Deal Room open?", a: "We are building it now. Members hear first when it opens." },
];

/** The home page for visitors who are not logged in: hero, the five investor problems and how we solve each, FAQ and a closing call to join. */
export function Landing() {
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
              alt="A modern self storage facility with rows of blue roll-up doors"
              width={1600}
              height={693}
              sizes="(max-width: 980px) 100vw, 680px"
              priority
              unoptimized
            />
          </div>
        </section>

        <section className="l-in l-sec">
          <div className="l-sec-head center l-sv">
            <div>
              <div className="l-eyebrow">Why investors get stuck</div>
              <h2 className="l-h2">Five problems. One place to solve them.</h2>
            </div>
          </div>
          <div className="l-pains">
            {PAINS.map(({ title, text, product, live, Scene }) => (
              <div key={product} className="l-pain l-sv">
                <div className="l-pain-copy">
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <div className="l-pain-foot">
                    <b>{product}</b>
                    {live && (
                      <Link className="l-btn sm" href="/signup">
                        Join free
                      </Link>
                    )}
                  </div>
                </div>
                <div className="l-pain-art">
                  <Scene />
                </div>
              </div>
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
              Your next facility starts with a <span style={{ color: "#38A3DC" }}>conversation</span>
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
        style={{ [edge]: 16, width: "calc(24% - 32px)", bottom: 0, height: 70, background: "repeating-linear-gradient(90deg, #262C3A 0 48px, transparent 48px 62px)" }}
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
          style={{ left: "calc(27% + 22px)", width: "calc(46% - 44px)", bottom: 0, height: 104, background: "repeating-linear-gradient(90deg, #0369A1 0 60px, transparent 60px 76px)" }}
        />
        <div className="l-slats" style={{ left: "calc(27% + 22px)", width: "calc(46% - 44px)", bottom: 0, height: 104 }} />
        <div style={{ left: "calc(27% + 174px)", bottom: 0, width: 60, height: 104, background: "#38A3DC" }} />
        <div className="l-roll" style={{ left: "calc(27% + 174px)", bottom: 0, width: 60, height: 46, background: "#0F1420" }} />
      </div>
      {side("right")}
    </div>
  );
}
