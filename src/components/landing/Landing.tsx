import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { Verified } from "@/components/Verified";
import { DEAL_TYPES, PARTNER_KINDS } from "@/lib/config";
import { money } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { AUTHOR_FIELDS, type Author, type DealType, type Metric } from "@/lib/types";

type LandingThread = { id: number; title: string; author: Author | null; category: { name: string; tint: string; ink: string } | null };
type LandingDeal = {
  id: number;
  type: DealType;
  off_market: boolean;
  title: string;
  city: string;
  state: string;
  raise_goal: number | null;
  raise_committed: number | null;
  metrics: Metric[];
};
type LandingPartner = { profile_id: string; kind: string; offer_label: string; offer: string; profile: Author | null };

const ARROW = "M5 12h14M13 6l6 6-6 6";

/** One person in a side column of the hero network. */
type NetChip = { key: string; href: string; name: string; color: string; verified: boolean; sub: string; pill: string; tint: string; ink: string };

// Shown in the hero when there is not yet enough live data to fill it, so the panel always reads as a full network.
const SAMPLE_ASKERS: NetChip[] = [
  { key: "s-a1", href: "/forums", name: "Dana Whitfield", color: "#FFD8BF", verified: true, sub: "Owner, 4 facilities", pill: "Buying", tint: "#FFEDE2", ink: "#B5440A" },
  { key: "s-a2", href: "/forums", name: "Marcus Lee", color: "#D8E6FF", verified: false, sub: "First-time buyer", pill: "Financing", tint: "#E6EEFD", ink: "#1D4ED8" },
  { key: "s-a3", href: "/forums", name: "Priya Shah", color: "#D4F2E4", verified: true, sub: "Operator", pill: "Operations", tint: "#DDF3E8", ink: "#17603F" },
];
const SAMPLE_PARTNERS: NetChip[] = [
  { key: "s-p1", href: "/deals/partners", name: "Harbor Capital", color: "#EADFFF", verified: true, sub: "Checks $250k to $2M", pill: "Investor", ...PARTNER_KINDS.Investor },
  { key: "s-p2", href: "/deals/partners", name: "Summit Bank", color: "#DFF4F4", verified: true, sub: "Loans up to 75% LTV", pill: "Lender", ...PARTNER_KINDS.Lender },
  { key: "s-p3", href: "/deals/partners", name: "Keystone Storage", color: "#FBF1DD", verified: false, sub: "Third-party management", pill: "Operator", ...PARTNER_KINDS.Operator },
];
const SAMPLE_DEAL: LandingDeal = {
  id: 0,
  type: "sale",
  off_market: true,
  title: "412-unit climate-controlled facility",
  city: "Tulsa",
  state: "OK",
  raise_goal: null,
  raise_committed: null,
  metrics: [
    { l: "Asking", v: "$4.2M" },
    { l: "Cap rate", v: "7.8%", c: "#17603F" },
    { l: "Occupancy", v: "91%" },
  ],
};

/** The home page for visitors who are not logged in: hero, what membership includes, and a closing call to join. */
export async function Landing() {
  const supabase = await createClient();
  const [userRes, threadsRes, dealsRes, partnersRes] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("threads")
      .select(`id, title, author:profiles!threads_author_id_fkey(${AUTHOR_FIELDS}), category:categories(name, tint, ink)`)
      .order("last_activity_at", { ascending: false })
      .limit(10),
    supabase
      .from("deals")
      .select("id, type, off_market, title, city, state, raise_goal, raise_committed, metrics")
      .eq("status", "live")
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("capital_partners")
      .select(`profile_id, kind, offer_label, offer, profile:profiles!capital_partners_profile_id_fkey(${AUTHOR_FIELDS})`)
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const threads = (threadsRes.data ?? []) as unknown as LandingThread[];
  const deals = (dealsRes.data ?? []) as unknown as LandingDeal[];
  const partners = (partnersRes.data ?? []) as unknown as LandingPartner[];
  const signedIn = !!userRes.data.user;

  // One recent thread per author, so the hero shows three different people.
  const seen = new Set<string>();
  const askers: NetChip[] = threads
    .filter((t) => t.author && !seen.has(t.author.id) && seen.add(t.author.id))
    .slice(0, 3)
    .map((t) => ({
      key: `t${t.id}`,
      href: `/forums/${t.id}`,
      name: t.author!.full_name,
      color: t.author!.avatar_color,
      verified: t.author!.verified,
      sub: t.author!.headline || "Member",
      pill: t.category?.name ?? "Question",
      tint: t.category?.tint ?? "#F1F3F8",
      ink: t.category?.ink ?? "#0B1F3A",
    }));
  const backers: NetChip[] = partners.map((p) => ({
    key: `p${p.profile_id}`,
    href: `/u/${p.profile_id}`,
    name: p.profile?.full_name ?? "Member",
    color: p.profile?.avatar_color ?? "#E6EBF3",
    verified: !!p.profile?.verified,
    sub: `${p.offer_label} ${p.offer}`,
    pill: p.kind,
    ...(PARTNER_KINDS[p.kind] ?? PARTNER_KINDS.Investor),
  }));
  const featured = deals.find((d) => d.type === "sale") ?? deals[0];
  const raise = deals.find((d) => d.type === "equity" && d.raise_goal && d.id !== featured?.id);

  return (
    <div className="l-page">
      <div className="l-banner">
        New: capital partners get an alert when a deal that fits what they fund is posted. <Link href="/deals/partners/join">Join as a partner</Link>
      </div>

      <div className="l-bar">
        <header className="l-in l-head">
          <Logo />
          <nav className="l-nav" aria-label="Main">
            <Link href="/forums">Forums</Link>
            <Link href="/deals">Deal Room</Link>
            <Link href="/tools">Tools</Link>
            <Link href="/learn">Learn</Link>
          </nav>
          <div className="l-head-end">
            {signedIn ? (
              <Link className="l-btn xs l-nudge" href="/forums">
                Go to The Storage Network <Icon d={ARROW} size={16} strokeWidth={2.4} />
              </Link>
            ) : (
              <>
                <Link className="l-login" href="/login">
                  Log in
                </Link>
                <Link className="l-btn xs l-nudge" href="/signup">
                  Join free <Icon d={ARROW} size={16} strokeWidth={2.4} />
                </Link>
              </>
            )}
          </div>
        </header>
      </div>

      <main>
        <section className="l-in l-hero">
          <h1 className="l-h1 l-in-up">
            Learn self storage from the people who <span className="l-mark">already own it</span>
          </h1>
          <p className="l-lead l-in-up l-d1">
            Ask questions in the forums, run the numbers with free tools, and find your next facility, partner or loan in the Deal Room.
          </p>
          <SignupForm id="hero-email" className="l-in-up l-d2" />
          <div className="l-note l-in-up l-d3">Free to join. No credit card.</div>

          <div className="l-panel l-in-up l-d4" role="group" aria-label="Members, a deal and capital partners">
            <div className="l-net">
              <NetColumn label="From the forums" side="l" chips={fill(askers, SAMPLE_ASKERS)} round />
              <Wire flip={false} />
              <FeaturedDeal deal={featured ?? SAMPLE_DEAL} />
              <Wire flip />
              <NetColumn label="Capital partners" side="r" chips={fill(backers, SAMPLE_PARTNERS)} />
            </div>
          </div>
        </section>

        <section className="l-in l-sec">
          <div className="l-sec-head l-sv">
            <div>
              <div className="l-eyebrow">One membership</div>
              <h2 className="l-h2">Everything you need, from the first question to the closing</h2>
            </div>
            <Link href="/signup" className="l-btn sm l-nudge">
              Join free <Icon d={ARROW} size={16} strokeWidth={2.4} />
            </Link>
          </div>

          <div className="l-bento">
            <div className="l-tile wide l-sv">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                <div style={{ maxWidth: 420, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="l-tile-head">
                    <span className="l-ico" style={{ background: "#0B1F3A", color: "#fff" }}>
                      <Icon name="chat" size={18} />
                    </span>
                    <h3>Forums</h3>
                  </div>
                  <p>Ask about cap rates, rent increases, loans and conversions. Owners and operators answer.</p>
                </div>
                <Link href="/forums" className="l-more l-nudge">
                  Browse the forums <Icon d={ARROW} size={14} strokeWidth={2.4} />
                </Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {threads.slice(0, 3).map((t, i) => (
                  <Link key={t.id} href={`/forums/${t.id}`} className={`l-row l-lift l-svl${i ? ` l-svl${i + 1}` : ""}`}>
                    <Avatar name={t.author?.full_name ?? "?"} color={t.author?.avatar_color ?? "#E6EBF3"} size={32} radius={16} fontSize={12} />
                    <b>{t.title}</b>
                    {t.category && (
                      <span className="l-pill" style={{ fontSize: 11, padding: "3px 8px", background: t.category.tint, color: t.category.ink }}>
                        {t.category.name}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <div className="l-tile tall l-sv l-sv2">
              <div className="l-tile-head">
                <span className="l-ico" style={{ background: "#DB520B", color: "#fff" }}>
                  <Icon name="briefcase" size={18} />
                </span>
                <h3>Deal Room</h3>
              </div>
              <p>Facilities for sale, capital raises, partnerships and loans, posted by members.</p>
              <div className="l-types">
                <span>For sale</span>
                <span>Capital raise</span>
                <span>Partnership</span>
                <span>Loan</span>
              </div>
              {raise && <RaiseCard deal={raise} />}
              <Link href="/deals" className="l-more l-nudge">
                See open deals <Icon d={ARROW} size={14} strokeWidth={2.4} />
              </Link>
            </div>

            <div className="l-tile warm l-sv l-lift">
              <div className="l-tile-head">
                <span className="l-ico" style={{ background: "#FFEDE2", color: "#B5440A" }}>
                  <Icon d="M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zM8 7h8M8 12h2M12 12h2M8 16h2M12 16h2" size={18} />
                </span>
                <h3>
                  <Link href="/tools" style={{ color: "inherit" }}>
                    Free tools
                  </Link>
                </h3>
              </div>
              <p>Run the numbers before you make an offer.</p>
              <div className="l-box" style={{ borderColor: "#F8D9C5", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5E6B7E" }}>Example</div>
                <div className="l-calc">
                  <span>Net income, 12 months</span>
                  <b>$194,000</b>
                </div>
                <div className="l-calc">
                  <span>Asking price</span>
                  <b>$2,400,000</b>
                </div>
                <div className="l-calc" style={{ borderTop: "1px solid #EEF1F5", paddingTop: 8, alignItems: "baseline" }}>
                  <b style={{ fontWeight: 700 }}>Cap rate</b>
                  <b style={{ fontSize: 26, color: "#17603F" }}>8.1%</b>
                </div>
              </div>
            </div>

            <div className="l-tile l-sv l-sv3 l-lift">
              <div className="l-tile-head">
                <span className="l-ico" style={{ background: "#DDF3E8", color: "#17603F" }}>
                  <Icon name="lock" size={18} />
                </span>
                <h3>Private by default</h3>
              </div>
              <p>Addresses and documents stay hidden until you approve who sees them.</p>
              <div className="l-box" aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <Avatar name="Verified member" color="#D8E6FF" size={32} radius={16} fontSize={12} />
                <span style={{ flex: "1 1 120px", lineHeight: 1.35 }}>
                  <b style={{ display: "block", fontSize: 14 }}>A verified member</b>
                  <span style={{ fontSize: 12, color: "#5E6B7E" }}>Wants the rent roll</span>
                </span>
                <span style={{ display: "flex", gap: 6 }}>
                  <span className="l-live" style={{ fontSize: 13, fontWeight: 700, padding: "7px 12px", borderRadius: 10, background: "#0B1F3A", color: "#fff" }}>
                    Approve
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, padding: "7px 12px", borderRadius: 10, background: "#F1F3F8", color: "#0B1F3A" }}>Decline</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="l-in" style={{ paddingBottom: 96 }}>
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
            <Link href="/deals">Deal Room</Link>
            <Link href="/tools">Tools</Link>
            <Link href="/learn">Learn</Link>
            <Link href="/guidelines">Guidelines</Link>
          </nav>
          <span style={{ fontSize: 13, color: "#5E6B7E" }}>© {new Date().getFullYear()} The Storage Network</span>
        </div>
      </footer>
    </div>
  );
}

/** Live entries first, topped up with samples to three. */
function fill(live: NetChip[], samples: NetChip[]) {
  return [...live, ...samples].slice(0, 3);
}

/** A labelled column of people on one side of the hero network. */
function NetColumn({ label, side, chips, round }: { label: string; side: "l" | "r"; chips: NetChip[]; round?: boolean }) {
  return (
    <div className="l-col">
      <div className={`l-label l-in-${side} l-n1`}>{label}</div>
      {chips.map((c, i) => (
        <Link key={c.key} href={c.href} className={`l-chip l-lift l-in-${side} l-n${i + 2}`}>
          <Avatar name={c.name} color={c.color} size={38} radius={round ? 19 : 12} fontSize={14} />
          <span className="l-chip-txt">
            <b>
              {c.name}
              {c.verified && <Verified size={14} />}
            </b>
            <span>{c.sub}</span>
          </span>
          <span className={`l-pill${side === "r" && i === 0 ? " l-live" : ""}`} style={{ background: c.tint, color: c.ink }}>
            {c.pill}
          </span>
        </Link>
      ))}
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

/** The curved lines that join each side column to the deal in the middle. */
function Wire({ flip }: { flip: boolean }) {
  const d = flip
    ? "M72 70 C32 70 40 150 0 150 M72 150 L0 150 M72 230 C32 230 40 150 0 150"
    : "M0 70 C40 70 32 150 72 150 M0 150 L72 150 M0 230 C40 230 32 150 72 150";
  return (
    <svg className="l-wire" viewBox="0 0 72 300" preserveAspectRatio="none" aria-hidden="true">
      <path pathLength={100} d={d} stroke="#C9D1DE" strokeWidth={2} fill="none" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function FeaturedDeal({ deal }: { deal: LandingDeal }) {
  const metrics = (deal.metrics ?? []).slice(0, 3);
  return (
    <Link href={deal.id ? `/deals/${deal.id}` : "/deals"} className="l-deal">
      <div className="l-art" style={{ height: 132 }} aria-hidden="true">
        <div style={{ left: 0, right: 0, bottom: 0, height: 26, background: "#C9D1DE" }} />
        <div style={{ left: "7%", right: "7%", bottom: 26, height: 74, background: "#fff", borderRadius: "6px 6px 0 0" }} />
        <div style={{ left: "7%", right: "7%", bottom: 100, height: 10, background: "#0B1F3A", borderRadius: "4px 4px 0 0" }} />
        <div className="l-doors" style={{ left: "calc(7% + 14px)", right: "calc(7% + 14px)", bottom: 26, height: 52 }} />
        <div className="l-slats" style={{ left: "calc(7% + 14px)", right: "calc(7% + 14px)", bottom: 26, height: 52 }} />
        {deal.off_market && (
          <span className="l-dark-pill" style={{ top: 12, right: 12 }}>
            Off-market
          </span>
        )}
      </div>
      <div className="l-deal-body">
        <div className="l-deal-logo" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 34 34">
            <rect width="34" height="34" rx="10" fill="#0B1F3A" />
            <rect x="8" y="9" width="18" height="16" rx="3" fill="#fff" />
            <path d="M11 13.5h12M11 17h12M11 20.5h12" stroke="#0B1F3A" strokeWidth="1.6" strokeLinecap="round" />
            <rect x="14" y="25" width="6" height="3" rx="1.5" fill="#F26B1D" />
          </svg>
        </div>
        <h2>{deal.title}</h2>
        <div className="l-where">
          <span>
            <Icon name="pin" size={14} />
            {deal.city}, {deal.state}
          </span>
          <span>
            <Icon name="briefcase" size={14} />
            {DEAL_TYPES[deal.type].name}
          </span>
        </div>
        <div className="l-tabs" aria-hidden="true">
          <span>Numbers</span>
          <span>Story</span>
          <span>Documents</span>
        </div>
        <div className="l-nums">
          {metrics.map((m) => (
            <div key={m.l}>
              <b style={m.c ? { color: m.c } : undefined}>{m.v}</b>
              <span>{m.l}</span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}

function RaiseCard({ deal }: { deal: LandingDeal }) {
  const goal = Number(deal.raise_goal);
  const committed = Number(deal.raise_committed ?? 0);
  const pct = Math.min(100, Math.round((committed / goal) * 100));
  return (
    <Link href={`/deals/${deal.id}`} className="l-mini l-lift">
      <div className="l-art" style={{ height: 110 }} aria-hidden="true">
        <div style={{ left: 0, right: 0, bottom: 0, height: 20, background: "#C9D1DE" }} />
        <div style={{ left: "8%", right: "8%", bottom: 20, height: 60, background: "#fff", borderRadius: "4px 4px 0 0" }} />
        <div style={{ left: "calc(8% - 4px)", right: "calc(8% - 4px)", bottom: 80, height: 9, background: "#0B1F3A", borderRadius: 4 }} />
        <div className="l-doors" style={{ left: "calc(8% + 12px)", right: "calc(8% + 12px)", bottom: 20, height: 42 }} />
        <span className="l-dark-pill" style={{ top: 10, right: 10, fontSize: 11 }}>
          Capital raise
        </span>
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <b style={{ display: "block", fontSize: 15, lineHeight: 1.35, color: "#0B1F3A" }}>{deal.title}</b>
        <div className="l-track">
          <div className="l-fill" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 8 }}>
          <b style={{ color: "#17603F" }}>{money(committed)} committed</b>
          <span style={{ color: "#5E6B7E", fontWeight: 600 }}>of {money(goal)}</span>
        </div>
      </div>
    </Link>
  );
}

/** Horizontal slat lines across a roll-up door. */
function Slats({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const ys = [];
  for (let i = y + 6; i < y + h - 6; i += 7) ys.push(i);
  return (
    <>
      {ys.map((i) => (
        <rect key={i} x={x} y={i} width={w} height={1} fill="rgba(255,255,255,0.22)" />
      ))}
    </>
  );
}

/**
 * One roll-up unit door with its frame and unit number. An `open` door is rolled up to that
 * height and shows the boxes stored inside.
 */
function UnitDoor({ x, y, w, h, color, num, open }: { x: number; y: number; w: number; h: number; color: string; num: string; open?: number }) {
  return (
    <>
      <rect x={x - 3} y={y - 3} width={w + 6} height={h + 3} fill="#E3E8F0" />
      <text x={x + w / 2} y={y - 8} fontSize={10} fontWeight={800} fill="#8FA0BC" textAnchor="middle">
        {num}
      </text>
      {open ? (
        <>
          <rect x={x} y={y} width={w} height={h} fill="#06142A" />
          {[
            [4, 22, 26],
            [34, 18, 22],
            [6, 18, 22, 22],
          ].map(([bx, bh, bw, lift = 0]) => (
            <g key={bx + lift}>
              <rect x={x + bx} y={y + h - bh - lift} width={bw} height={bh} fill="#C98B4A" />
              <rect x={x + bx + bw / 2 - 2} y={y + h - bh - lift} width={4} height={bh} fill="#E7B279" />
            </g>
          ))}
          <g className="l-roll">
            <rect x={x} y={y} width={w} height={open} fill={color} />
            <Slats x={x} y={y} w={w} h={open} />
            <rect x={x} y={y + open - 5} width={w} height={5} fill="rgba(0,0,0,0.35)" />
          </g>
        </>
      ) : (
        <>
          <rect x={x} y={y} width={w} height={h} fill={color} />
          <Slats x={x} y={y} w={w} h={h} />
          <rect x={x} y={y + h - 6} width={w} height={6} fill="rgba(0,0,0,0.28)" />
          <rect x={x + w / 2 - 8} y={y + h - 15} width={16} height={4} rx={2} fill="rgba(0,0,0,0.4)" />
        </>
      )}
    </>
  );
}

/** A low side building with four navy doors and two wall lamps. */
function TownSide({ row }: { row: string }) {
  return (
    <svg className="l-town-side l-rise l-rise2" viewBox="0 0 316 136">
      <rect width={316} height={14} rx={5} fill="#C5D1E3" />
      <rect x={8} y={14} width={300} height={122} fill="#F5F6FA" />
      {[90, 226].map((lx) => (
        <g key={lx}>
          <rect x={lx - 7} y={22} width={14} height={4} rx={2} fill="#9AA8BF" />
          <path d={`M${lx - 7} 26 L${lx - 14} 52 L${lx + 14} 52 L${lx + 7} 26Z`} fill="rgba(255,214,140,0.1)" />
        </g>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <UnitDoor key={i} x={30 + i * 68} y={56} w={52} h={80} color="#1E3560" num={`${row}${i + 1}`} />
      ))}
    </svg>
  );
}

/** The row of storage buildings at the foot of the closing panel. */
function Town() {
  return (
    <div className="l-town" role="img" aria-label="A Storage Network self storage facility with orange roll-up doors, one of them open">
      <TownSide row="B" />
      <svg className="l-town-main l-rise" viewBox="0 0 456 196">
        <rect width={456} height={16} rx={6} fill="#C5D1E3" />
        <rect x={10} y={16} width={436} height={180} fill="#fff" />
        <rect x={113} y={28} width={230} height={30} rx={6} fill="#0B1F3A" />
        <text x={228} y={48} fontSize={15} fontWeight={800} fill="#fff" textAnchor="middle" letterSpacing={0.5}>
          The Storage Network
        </text>
        <rect x={125} y={52} width={206} height={2} fill="#F26B1D" />
        {[0, 1, 2, 3, 4].map((i) => (
          <UnitDoor key={i} x={32 + i * 80} y={84} w={58} h={112} color="#DB520B" num={`10${i + 1}`} open={i === 2 ? 44 : undefined} />
        ))}
        {[16, 431].map((bx) => (
          <g key={bx}>
            <rect x={bx} y={170} width={9} height={26} rx={3} fill="#F2B21D" />
            <rect x={bx} y={177} width={9} height={4} fill="#0B1F3A" />
          </g>
        ))}
      </svg>
      <TownSide row="C" />
    </div>
  );
}
