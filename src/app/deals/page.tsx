import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { DealCard, type DealCardData } from "@/components/deals/DealCard";
import { PartnerCard, type PartnerCardData } from "@/components/deals/PartnerCard";
import { SelectNav } from "@/components/deals/SelectNav";
import { getViewer } from "@/lib/auth";
import { DEAL_SIZES, DEAL_TYPE_IDS, DEAL_TYPES, PROPERTY_TYPES, REGIONS } from "@/lib/config";
import { count, money } from "@/lib/format";
import { ICONS } from "@/lib/icons";
import { DEAL_CARD_SELECT, getDealMarks } from "@/lib/queries/deals";
import { createClient } from "@/lib/supabase/server";
import { AUTHOR_FIELDS, type DealType, type PropertyType } from "@/lib/types";

export const metadata: Metadata = { title: "Deal Room" };

type Search = { tab?: string; prop?: string; size?: string; region?: string; verified?: string; off?: string; sort?: string; limit?: string };

const PAGE = 12;
const TABS = ["all", ...DEAL_TYPE_IDS, "partners", "saved"] as const;
const SORTS = [
  { value: "new", label: "Newest first" },
  { value: "interest", label: "Most interest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

function href(base: Search, patch: Partial<Search>) {
  const merged = { ...base, ...patch };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) if (v && v !== "all" && v !== "any") qs.set(k, v);
  const s = qs.toString();
  return s ? `/deals?${s}` : "/deals";
}

export default async function DealRoomPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const tab = (TABS as readonly string[]).includes(sp.tab ?? "") ? sp.tab! : "all";
  const prop = PROPERTY_TYPES.some((p) => p.id === sp.prop) ? (sp.prop as PropertyType) : undefined;
  const size = DEAL_SIZES.find((s) => s.id === sp.size) ?? DEAL_SIZES[0];
  const region = REGIONS.includes(sp.region ?? "") ? sp.region : undefined;
  const verifiedOnly = sp.verified === "1";
  const offOnly = sp.off === "1";
  const sort = SORTS.some((s) => s.value === sp.sort) ? sp.sort! : "new";
  const limit = Math.min(Math.max(Number(sp.limit) || PAGE, PAGE), 120);
  const base: Search = { ...sp, limit: undefined };
  const showPartners = tab === "partners";

  const supabase = await createClient();
  const viewer = await getViewer();

  const [statsRes, typeRows, propRows, savedRes, mineRes, alertsRes, railRes] = await Promise.all([
    supabase.rpc("deal_room_stats"),
    supabase.from("deals").select("type").eq("status", "live"),
    supabase.from("deals").select("property_type").eq("status", "live"),
    viewer ? supabase.from("deal_saves").select("deal_id").eq("user_id", viewer.id) : null,
    viewer ? supabase.from("deals").select("id", { count: "exact", head: true }).eq("poster_id", viewer.id) : null,
    viewer ? supabase.from("deal_alerts").select("id", { count: "exact", head: true }).eq("user_id", viewer.id) : null,
    supabase
      .from("capital_partners")
      .select(`profile_id, kind, offer, profile:profiles!capital_partners_profile_id_fkey(full_name, avatar_color)`)
      .eq("active", true)
      .order("created_at")
      .limit(4),
  ]);

  const stats = (statsRes.data ?? { active: 0, total_value: 0, partners: 0, closed_this_year: 0, new_this_week: 0 }) as {
    active: number; total_value: number; partners: number; closed_this_year: number; new_this_week: number;
  };
  const typeCounts = new Map<string, number>();
  for (const r of typeRows.data ?? []) typeCounts.set(r.type, (typeCounts.get(r.type) ?? 0) + 1);
  const propCounts = new Map<string, number>();
  for (const r of propRows.data ?? []) propCounts.set(r.property_type, (propCounts.get(r.property_type) ?? 0) + 1);
  const savedIds = (savedRes?.data ?? []).map((s) => s.deal_id);

  let deals: DealCardData[] = [];
  let partners: PartnerCardData[] = [];
  let total = 0;
  let connected = new Set<string>();
  let marks = { saved: new Set<number>(), requested: new Set<number>() };

  if (showPartners) {
    let q = supabase
      .from("capital_partners")
      .select(`*, profile:profiles!capital_partners_profile_id_fkey${verifiedOnly ? "!inner" : ""}(${AUTHOR_FIELDS}, location)`, { count: "exact" })
      .eq("active", true);
    if (verifiedOnly) q = q.eq("profile.verified", true);
    const { data, count: c, error } = await q.order("created_at").range(0, limit - 1);
    if (error) throw new Error(error.message);
    partners = (data ?? []) as unknown as PartnerCardData[];
    total = c ?? 0;
    if (viewer && partners.length) {
      const { data: conns } = await supabase
        .from("partner_connections")
        .select("partner_id")
        .eq("user_id", viewer.id)
        .in("partner_id", partners.map((p) => p.profile_id));
      connected = new Set((conns ?? []).map((c) => c.partner_id));
    }
  } else {
    const select = verifiedOnly ? DEAL_CARD_SELECT.replace("deals_poster_id_fkey(", "deals_poster_id_fkey!inner(") : DEAL_CARD_SELECT;
    let q = supabase.from("deals").select(select, { count: "exact" }).eq("status", "live");
    if (DEAL_TYPE_IDS.includes(tab as DealType)) q = q.eq("type", tab as DealType);
    if (tab === "saved") q = q.in("id", savedIds.length ? savedIds : [-1]);
    if (prop) q = q.eq("property_type", prop);
    if ("min" in size) q = q.gte("amount", size.min);
    if ("max" in size) q = q.lt("amount", size.max);
    if (region) q = q.eq("region", region);
    if (offOnly) q = q.eq("off_market", true);
    if (verifiedOnly) q = q.eq("poster.verified", true);
    if (sort === "interest") q = q.order("interest_count", { ascending: false });
    else if (sort === "price_asc") q = q.order("amount", { ascending: true });
    else if (sort === "price_desc") q = q.order("amount", { ascending: false });
    q = q.order("created_at", { ascending: false });
    const { data, count: c, error } = await q.range(0, limit - 1);
    if (error) throw new Error(error.message);
    deals = (data ?? []) as unknown as DealCardData[];
    total = c ?? 0;
    marks = await getDealMarks(supabase, viewer?.id, deals.map((d) => d.id));
  }

  const headings: Record<string, [string, string]> = {
    all: ["All deals", "Facilities for sale, projects raising money and people looking for partners."],
    partners: ["Capital partners", "Investors, lenders and operators who are actively looking for deals."],
    saved: ["Saved deals", "Deals you bookmarked to look at later."],
  };
  for (const id of DEAL_TYPE_IDS) headings[id] = [DEAL_TYPES[id].name, DEAL_TYPES[id].blurb];

  const tabs = [
    { id: "all", label: "All deals", count: stats.active, icon: ICONS.grid },
    ...DEAL_TYPE_IDS.map((id) => ({ id, label: DEAL_TYPES[id].name, count: typeCounts.get(id) ?? 0, icon: DEAL_TYPES[id].icon })),
    { id: "partners", label: "Capital partners", count: stats.partners, icon: ICONS.coin },
  ];
  const hasFilters = !!prop || size.id !== "any" || !!region || verifiedOnly || offOnly;
  const shown = showPartners ? partners.length : deals.length;

  return (
    <>
      <div className="wrap" style={{ paddingTop: 24 }}>
        <section className="m-hero" style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center" }}>
          <svg width="620" height="340" viewBox="0 0 620 340" aria-hidden="true" style={{ position: "absolute", right: -60, top: -40 }}>
            <defs>
              <radialGradient id="dGlow" cx="0.55" cy="0.45" r="0.6">
                <stop offset="0" stopColor="#F26B1D" stopOpacity="0.35" />
                <stop offset="1" stopColor="#F26B1D" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="620" height="340" fill="url(#dGlow)" />
          </svg>
          <div style={{ position: "relative", flex: "1 1 460px", maxWidth: 640 }}>
            <span className="m-live">
              {stats.new_this_week} new {stats.new_this_week === 1 ? "deal" : "deals"} this week
            </span>
            <h1>Deal Room</h1>
            <p>Post a facility for sale, raise money for your next project, or find the partner with the cash or experience you are missing.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 26, alignItems: "center" }}>
              <Link className="m-btn m-btn-o" href="/deals/new" style={{ minHeight: 48, padding: "0 22px" }}>
                <Icon name="plus" size={18} strokeWidth={2.4} />
                Post a deal
              </Link>
              <Link className="m-btn m-btn-w" href="/deals/partners/join" style={{ minHeight: 48 }}>
                Join as a capital partner
              </Link>
            </div>
          </div>
          <div style={{ position: "relative", flex: "0 1 420px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="d-stat"><b>{count(stats.active)}</b><span>Active deals</span></div>
            <div className="d-stat"><b>{money(Number(stats.total_value))}</b><span>Deal value posted</span></div>
            <div className="d-stat"><b>{count(stats.partners)}</b><span>Capital partners</span></div>
            <div className="d-stat"><b style={{ color: "#FFB98E" }}>{count(stats.closed_this_year)}</b><span>Closed by members this year</span></div>
          </div>
        </section>
      </div>

      <div className="wrap page-cols">
        <aside className="col-side" aria-label="Your deals and filters">
          <div className="m-card" style={{ padding: 12 }}>
            <Link className={`m-side${tab === "saved" ? " on" : ""}`} href={href(base, { tab: "saved" })}>
              <span className="m-ic" style={{ background: "#FFEDE2" }}>
                <Icon name="bookmark" size={17} stroke={tab === "saved" ? "#FFFFFF" : "#DB520B"} />
              </span>
              Saved deals<span className="m-n">{savedIds.length}</span>
            </Link>
            <Link className="m-side" href="/deals/mine">
              <span className="m-ic" style={{ background: "#EEF2F8" }}>
                <Icon name="briefcase" size={17} stroke="#0B1F3A" />
              </span>
              My posted deals<span className="m-n">{mineRes?.count ?? 0}</span>
            </Link>
            <Link className="m-side" href="/deals/alerts">
              <span className="m-ic" style={{ background: "#EEF2F8" }}>
                <Icon name="bell" size={17} stroke="#0B1F3A" />
              </span>
              Deal alerts<span className="m-n">{alertsRes?.count ?? 0}</span>
            </Link>
          </div>

          <div className="m-card" style={{ padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px 0", minHeight: 36 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800 }}>Filters</h2>
              {hasFilters && (
                <Link href={href({ tab: sp.tab, sort: sp.sort }, {})} style={{ color: "#B5440A", fontWeight: 700, fontSize: 13, padding: "0 6px" }}>
                  Clear all
                </Link>
              )}
            </div>
            {!showPartners && (
              <>
                <div className="m-sec">Property type</div>
                <Link className={`m-side${!prop ? " on" : ""}`} href={href(base, { prop: undefined })}>
                  <span className="m-ic" style={{ background: "#E6EBF3" }}>
                    <Icon name="grid" size={17} stroke={!prop ? "#FFFFFF" : "#0B1F3A"} />
                  </span>
                  Any property<span className="m-n">{stats.active}</span>
                </Link>
                {PROPERTY_TYPES.map((p) => {
                  const on = p.id === prop;
                  return (
                    <Link key={p.id} className={`m-side${on ? " on" : ""}`} href={href(base, { prop: p.id })}>
                      <span className="m-ic" style={{ background: p.tint }}>
                        <Icon d={p.icon} size={17} stroke={on ? "#FFFFFF" : p.color} />
                      </span>
                      <span style={{ minWidth: 0, lineHeight: 1.25 }}>{p.name}</span>
                      <span className="m-n">{propCounts.get(p.id) ?? 0}</span>
                    </Link>
                  );
                })}
                <div className="m-sec">Deal size</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "0 10px" }}>
                  {DEAL_SIZES.map((z) => (
                    <Link key={z.id} className={`d-chip sm${z.id === size.id ? " on" : ""}`} href={href(base, { size: z.id })}>
                      {z.label}
                    </Link>
                  ))}
                </div>
                <div className="m-sec">Location</div>
                <div style={{ padding: "0 10px" }}>
                  <SelectNav
                    param="region"
                    value={region ?? ""}
                    label="Region"
                    hideLabel
                    style={{ fontSize: 14 }}
                    options={[{ value: "", label: "Anywhere in the US" }, ...REGIONS.map((r) => ({ value: r, label: r }))]}
                  />
                </div>
              </>
            )}
            <div className="m-sec">More</div>
            <Link className={`d-switch${verifiedOnly ? " on" : ""}`} role="switch" aria-checked={verifiedOnly} href={href(base, { verified: verifiedOnly ? undefined : "1" })}>
              Verified {showPartners ? "partners" : "posters"} only
              <span className="d-track"><span className="d-knob" /></span>
            </Link>
            {!showPartners && (
              <Link className={`d-switch${offOnly ? " on" : ""}`} role="switch" aria-checked={offOnly} href={href(base, { off: offOnly ? undefined : "1" })}>
                Off-market only
                <span className="d-track"><span className="d-knob" /></span>
              </Link>
            )}
          </div>
        </aside>

        <main className="col-main" style={{ gap: 16 }}>
          <nav className="d-tabs" aria-label="Deal types">
            {tabs.map((t) => (
              <Link key={t.id} className={`d-tab${t.id === tab ? " on" : ""}`} aria-current={t.id === tab ? "true" : undefined} href={href(base, { tab: t.id })}>
                <Icon d={t.icon} size={16} />
                {t.label}
                <span className="d-cnt">{count(t.count)}</span>
              </Link>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>{headings[tab][0]}</h2>
              <p style={{ marginTop: 2, fontSize: 14, color: "#5E6B7E" }}>{headings[tab][1]}</p>
            </div>
            {!showPartners && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#5E6B7E" }}>
                <SelectNav param="sort" value={sort} label="Sort" options={SORTS} style={{ width: "auto", minHeight: 40, fontSize: 14, fontWeight: 700 }} />
              </div>
            )}
          </div>

          {!showPartners && deals.length > 0 && (
            <div className="d-grid">
              {deals.map((d) => (
                <DealCard key={d.id} deal={d} saved={marks.saved.has(d.id)} requested={marks.requested.has(d.id)} viewerId={viewer?.id} />
              ))}
            </div>
          )}
          {showPartners && partners.length > 0 && (
            <div className="d-grid">
              {partners.map((p) => (
                <PartnerCard key={p.profile_id} partner={p} connected={connected.has(p.profile_id)} viewerId={viewer?.id} />
              ))}
            </div>
          )}

          {shown === 0 && (
            <div className="m-card m-empty">
              <b>{tab === "saved" ? "No saved deals yet" : showPartners ? "No capital partners match" : "No deals match these filters"}</b>
              <span>
                {tab === "saved"
                  ? "Tap the bookmark on any deal to keep it here."
                  : "Try a different property type or deal size, or create a deal alert."}
              </span>
            </div>
          )}
          {total > shown && (
            <Link className="m-btn m-btn-line" href={href(base, { limit: String(limit + PAGE) })} scroll={false} style={{ alignSelf: "center", marginTop: 8 }}>
              {showPartners ? "Load more capital partners" : "Load more deals"}
            </Link>
          )}
        </main>

        <aside className="col-rail" aria-label="Deal Room help">
          <div className="m-card" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800 }}>How the Deal Room works</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                ["#FFEDE2", "#B5440A", "Post your deal", "A short summary with the key numbers. Takes about 5 minutes."],
                ["#DDF3E8", "#17603F", "Members reach out", "You decide who gets the address and the full numbers."],
                ["#E6EEFD", "#1D4ED8", "Talk it through", "Message privately, ask the forum for a second opinion, then close with your own team."],
              ].map(([bg, ink, title, text], i) => (
                <div key={i} style={{ display: "flex", gap: 12 }}>
                  <span className="d-step" style={{ background: bg, color: ink }}>{i + 1}</span>
                  <span style={{ fontSize: 14, lineHeight: 1.5, color: "#4A576B" }}>
                    <b style={{ display: "block", color: "#0F1B2D" }}>{title}</b>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {(railRes.data ?? []).length > 0 && (
            <div className="m-card" style={{ padding: 20 }}>
              <h3 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 800 }}>Capital partners looking for deals</h3>
              {(railRes.data ?? []).map((p) => (
                <Link key={p.profile_id} className="d-row" href={`/u/${p.profile_id}`} style={{ color: "#0F1B2D" }}>
                  <Avatar name={p.profile?.full_name ?? "?"} color={p.profile?.avatar_color ?? "#E6EBF3"} size={40} radius={13} fontSize={13} />
                  <span style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
                    <span style={{ display: "block", fontWeight: 800, fontSize: 14 }}>{p.profile?.full_name}</span>
                    <span style={{ display: "block", fontSize: 12, color: "#5E6B7E" }}>
                      {p.kind} · {p.offer}
                    </span>
                  </span>
                </Link>
              ))}
              <Link className="m-btn m-btn-s" href={href({}, { tab: "partners" })} style={{ width: "100%", marginTop: 12 }}>
                See all capital partners
              </Link>
            </div>
          )}

          <div className="m-promo">
            <svg width="150" height="120" viewBox="0 0 150 120" aria-hidden="true" style={{ position: "absolute", right: -24, top: -18 }}>
              <circle cx="90" cy="54" r="50" fill="#F26B1D" fillOpacity="0.22" />
              <path d="M70 60a20 20 0 0140 0c0 18 8 20 8 20H62s8-2 8-20M84 88a6 6 0 0012 0" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3>Never miss a deal</h3>
            <p style={{ marginBottom: 14 }}>Tell us what you are looking for and we will email you when a matching deal is posted.</p>
            <div style={{ position: "relative", display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
              {["Ohio", "Under $3M", "Value-add"].map((c) => (
                <span key={c} style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,0.1)" }}>
                  {c}
                </span>
              ))}
            </div>
            <Link className="m-btn m-btn-o" href="/deals/alerts" style={{ position: "relative" }}>
              Create a deal alert
            </Link>
          </div>

          <div className="m-note">
            <Icon name="shieldCheck" size={22} stroke="#B5440A" style={{ flex: "none" }} />
            <span>
              <b>Do your own homework</b>
              Deals are posted by members. We verify who people are, not the numbers, and we do not give investment advice. Never send money before your own due diligence.
            </span>
          </div>
        </aside>
      </div>
    </>
  );
}
