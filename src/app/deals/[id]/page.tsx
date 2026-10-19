import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { Verified } from "@/components/Verified";
import { DealArt } from "@/components/deals/DealArt";
import { DealProvider, InterestCount } from "@/components/deals/page/DealContext";
import { DocsButton, DocState, DocsSubtitle, type DocAccess } from "@/components/deals/page/Docs";
import { FollowPersonButton } from "@/components/deals/page/FollowPersonButton";
import { Gallery, type GalleryItem } from "@/components/deals/page/Gallery";
import { HeaderActions } from "@/components/deals/page/HeaderActions";
import { AreaMap } from "@/components/deals/page/Illustrations";
import { ActionCard, InvestCard } from "@/components/deals/page/InvestCard";
import { JumpNav } from "@/components/deals/page/JumpNav";
import { AnswerForm, AskForm, QuestionLike } from "@/components/deals/page/Questions";
import { ScenarioPicker } from "@/components/deals/page/ScenarioPicker";
import { getViewer } from "@/lib/auth";
import { DEAL_TYPES, FEATURES, PROPERTY_BY_ID } from "@/lib/config";
import { count, timeAgo } from "@/lib/format";
import { ICONS, type IconName } from "@/lib/icons";
import { photoUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { AUTHOR_FIELDS, type Author, type DealDetails, type DealPhoto, type Metric } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

const PLAN_COLORS = [
  { color: "#DB520B", tint: "#FFEDE2" },
  { color: "#2563EB", tint: "#E6EEFD" },
  { color: "#7C4DDB", tint: "#EFE8FD" },
  { color: "#16855A", tint: "#DDF3E8" },
  { color: "#0B1F3A", tint: "#E6EBF3" },
];

const ART_SETS: Record<string, GalleryItem[]> = {
  building: [
    { label: "Front of the facility", art: "ext", bg: "linear-gradient(180deg,#E6EBF3,#F5F6FA)", icon: ICONS.build },
    { label: "Gate and keypad", art: "gate", bg: "linear-gradient(180deg,#DFF4F4,#F5F6FA)", icon: "M4 21V8M20 21V8M4 8h16M8 8v13M12 8v13M16 8v13M4 14h16" },
    { label: "Climate-controlled hallway", art: "aisle", bg: "#EEF2F8", icon: "M3 3l7 7v4l-7 7M21 3l-7 7v4l7 7M10 10h4M10 14h4" },
    { label: "Office and rentals", art: "office", bg: "linear-gradient(180deg,#FBF1DD,#F5F6FA)", icon: "M4 21V7h16v14M4 7l2-4h12l2 4M9 21v-6h6v6" },
  ],
};

function parseId(id: string) {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const id = parseId((await params).id);
  if (!id) return { title: "Deal" };
  const supabase = await createClient();
  const { data } = await supabase.from("deals").select("title").eq("id", id).maybeSingle();
  return { title: data?.title ?? "Deal" };
}

export default async function DealPage({ params }: Params) {
  const id = parseId((await params).id);
  if (!id) notFound();

  const supabase = await createClient();
  const viewer = await getViewer();

  const { data: deal } = await supabase
    .from("deals")
    .select(`*, poster:profiles!deals_poster_id_fkey(${AUTHOR_FIELDS}, bio, location, created_at)`)
    .eq("id", id)
    .maybeSingle();
  if (!deal) notFound();

  const poster = deal.poster as (Author & { bio: string; location: string; created_at: string }) | null;
  const own = viewer?.id === deal.poster_id;
  const type = DEAL_TYPES[deal.type];
  const prop = PROPERTY_BY_ID[deal.property_type];
  const details = (deal.details ?? {}) as DealDetails;
  const metrics = (deal.metrics as Metric[] | null) ?? [];
  const photos = (deal.photos as DealPhoto[] | null) ?? [];
  const firstName = poster?.full_name.split(" ")[0] ?? "the poster";

  const [, canSeeRes, docsRes, questionsRes, myReqRes, savedRes, reportRes, followRes, posterDealsRes, similarRes, threadRes] = await Promise.all([
    // Count the view alongside the other reads; supabase-js only sends a request once awaited.
    supabase.rpc("increment_deal_views", { p_deal_id: id }).then(() => null),
    viewer ? supabase.rpc("can_see_private", { p_deal_id: id }) : null,
    supabase.from("deal_documents").select("*").eq("deal_id", id).order("id"),
    supabase
      .from("deal_questions")
      .select(`*, author:profiles!deal_questions_author_id_fkey(${AUTHOR_FIELDS})`)
      .eq("deal_id", id)
      .order("created_at", { ascending: false }),
    viewer ? supabase.from("deal_requests").select("status").eq("deal_id", id).eq("user_id", viewer.id).maybeSingle() : null,
    viewer ? supabase.from("deal_saves").select("deal_id").eq("deal_id", id).eq("user_id", viewer.id).maybeSingle() : null,
    viewer ? supabase.from("deal_reports").select("deal_id").eq("deal_id", id).eq("user_id", viewer.id).maybeSingle() : null,
    viewer && !own
      ? supabase.from("follows").select("followee_id").eq("follower_id", viewer.id).eq("followee_id", deal.poster_id).maybeSingle()
      : null,
    supabase.from("deals").select("status").eq("poster_id", deal.poster_id),
    supabase
      .from("deals")
      .select("id, type, property_type, title, city, state, metrics, photos")
      .eq("status", "live")
      .neq("id", id)
      .or(`type.eq.${deal.type},property_type.eq.${deal.property_type}`)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("threads")
      .select("id, title, reply_count")
      .eq("author_id", deal.poster_id)
      .ilike("title", `%${deal.city}%`)
      .limit(1)
      .maybeSingle(),
  ]);

  const canSee = !!canSeeRes?.data;
  const address = canSee ? (await supabase.from("deal_private").select("address").eq("deal_id", id).maybeSingle()).data?.address : null;
  const myStatus = myReqRes?.data?.status;
  const access: DocAccess = own ? "own" : canSee ? "open" : myStatus === "declined" ? "declined" : myStatus === "pending" ? "pending" : "none";

  const docs = docsRes.data ?? [];
  const questions = questionsRes.data ?? [];
  const likedRes =
    viewer && questions.length
      ? await supabase.from("question_likes").select("question_id").eq("user_id", viewer.id).in("question_id", questions.map((q) => q.id))
      : null;
  const liked = new Set((likedRes?.data ?? []).map((l) => l.question_id));

  const posterDeals = posterDealsRes.data ?? [];
  const sponsorStats: Metric[] = details.sponsor_stats ?? [
    { l: "Deals posted", v: String(posterDeals.length) },
    { l: "Closed", v: String(posterDeals.filter((d) => d.status === "closed").length) },
    { l: "Member since", v: poster ? String(new Date(poster.created_at).getFullYear()) : "—" },
  ];

  // Gallery: uploaded photos, else illustrations that fit the property type.
  const illustrated = photos.length === 0;
  const gallery: GalleryItem[] = illustrated
    ? deal.property_type === "facility" || deal.property_type === "conv" || deal.property_type === "portfolio"
      ? deal.property_type === "facility"
        ? ART_SETS.building
        : [{ label: prop.name, art: deal.property_type, bg: type.tint, icon: prop.icon }, ...ART_SETS.building.slice(1)]
      : [{ label: prop.name, art: deal.property_type, bg: type.tint, icon: prop.icon }]
    : photos.map((p, i) => ({ label: p.label || `Photo ${i + 1}`, url: photoUrl(p.path), bg: "#E6EBF3", icon: ICONS.camera }));

  const keyStats: (Metric & { after?: string })[] = details.key_stats ?? metrics;
  const tags = details.tags ?? deal.features.map((f) => FEATURES.find((x) => x.id === f)?.label).filter((x): x is string => !!x);
  const scenarios = details.scenarios ?? [];
  const expected = scenarios.find((s) => s.id === "exp") ?? scenarios[1] ?? scenarios[0];
  const minK = details.min_investment ?? 50;
  const competitors = details.competitors ?? [];
  const hasNumbers = !!(details.numbers?.length || details.capital_stack || (deal.type === "equity" && scenarios.length));
  const hasMarket = !!(details.market?.length || competitors.length);

  const jump = [
    { id: "ov", label: "Overview" },
    ...(hasNumbers ? [{ id: "num", label: "The numbers" }] : []),
    { id: "loc", label: "Location" },
    { id: "docs", label: "Documents" },
    { id: "qa", label: "Questions", count: questions.length },
  ];

  const viewerReq = !!myStatus;

  return (
    <DealProvider dealId={deal.id} own={own} requested={viewerReq} amountK={minK * 2} scenario={expected?.id ?? "exp"}>
      <div className="wrap" style={{ paddingTop: 22 }}>
        {own && (
          <div className="m-alert ok" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            <span style={{ flex: 1, minWidth: 220 }}>
              This is your deal{deal.status === "closed" ? " and it is marked closed" : ""}. {deal.interest_count} members have sent a request.
            </span>
            <Link className="m-btn m-btn-n" href="/deals/mine" style={{ minHeight: 40 }}>
              Review requests
            </Link>
          </div>
        )}
        {!own && deal.status === "closed" && (
          <div className="m-alert ok" style={{ marginBottom: 16 }}>
            This deal is closed. It stays here so members can learn from it.
          </div>
        )}

        <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#5E6B7E", flexWrap: "wrap" }}>
          <Link href="/deals" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#5E6B7E" }}>
            <Icon name="back" size={16} strokeWidth={2.2} />
            Deal Room
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/deals?tab=${deal.type}`} style={{ color: "#5E6B7E" }}>
            {type.name}
          </Link>
          <span aria-hidden="true">/</span>
          <span style={{ color: "#0F1B2D" }} aria-current="page">
            {deal.city}, {deal.state}
          </span>
        </nav>

        <div style={{ display: "flex", gap: 20, alignItems: "flex-end", flexWrap: "wrap", marginTop: 16 }}>
          <div style={{ flex: "1 1 560px" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="d-pill" style={{ background: type.tint, color: type.ink }}>
                <span className="d-dot" style={{ background: type.dot }} />
                {type.name}
              </span>
              <span className="d-pill" style={{ background: prop.tint, color: prop.color }}>
                {prop.name}
              </span>
              {deal.off_market && (
                <span className="d-pill" style={{ background: "#0B1F3A", color: "#fff" }}>
                  <Icon name="lock" size={12} strokeWidth={2.6} />
                  Off-market
                </span>
              )}
              {tags[0] && (
                <span className="d-pill" style={{ background: "#E6EBF3", color: "#0B1F3A" }}>
                  {tags[0]}
                </span>
              )}
            </div>
            <h1 className="x-h1" style={{ margin: "14px 0 0", fontSize: 36, lineHeight: 1.12, fontWeight: 800, letterSpacing: "-0.03em", maxWidth: 900 }}>
              {deal.title}
            </h1>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 12, fontSize: 14, fontWeight: 600, color: "#5E6B7E" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="pin" size={15} strokeWidth={2.2} />
                {address ? `${address} · ${deal.city}, ${deal.state}` : `${deal.city}, ${deal.state} · exact address after approval`}
              </span>
              <span>Posted {timeAgo(deal.created_at)}</span>
              <span>{count(deal.views + 1)} views</span>
              <span style={{ color: "#17603F" }}>
                <InterestCount base={deal.interest_count} suffix={deal.type === "equity" ? "investors interested" : "interested"} />
              </span>
            </div>
          </div>
          <HeaderActions dealId={deal.id} saved={!!savedRes?.data} reported={!!reportRes?.data} own={own} />
        </div>

        <Gallery items={gallery} illustrated={illustrated} />
      </div>

      <div className="wrap" style={{ paddingTop: 24, paddingBottom: 56, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        <main style={{ flex: "999 1 640px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {keyStats.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
              {keyStats.map((k, i) => (
                <div key={i} className="x-key" style={{ background: "#fff", border: "1px solid #E7EAF0" }}>
                  <span>{k.l}</span>
                  <b style={{ color: k.c }}>
                    {k.v}
                    {k.after && (
                      <span style={{ display: "inline", fontSize: 14, color: "#17603F", fontWeight: 800 }}> → {k.after}</span>
                    )}
                  </b>
                </div>
              ))}
            </div>
          )}

          <JumpNav items={jump} />

          <section id="ov" className="x-sec">
            <h2 className="x-h2">The deal in plain English</h2>
            <p className="x-p" style={{ marginTop: 14 }}>
              {deal.story || "The poster has not added a description yet."}
            </p>
            {details.plan && details.plan.length > 0 && (
              <>
                <h3 style={{ margin: "26px 0 6px", fontSize: 16, fontWeight: 800 }}>The plan, step by step</h3>
                <div>
                  {details.plan.map((p, i) => {
                    const c = PLAN_COLORS[i % PLAN_COLORS.length];
                    return (
                      <div key={i} className="x-plan">
                        <span style={{ width: 42, height: 42, borderRadius: 13, flex: "none", display: "grid", placeItems: "center", background: c.tint }}>
                          <Icon d={ICONS[p.icon as IconName] ?? ICONS.check} size={19} stroke={c.color} />
                        </span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                            <b style={{ fontSize: 15 }}>{p.title}</b>
                            <span style={{ fontSize: 12, fontWeight: 800, color: "#5E6B7E", background: "#F3F5F9", padding: "3px 8px", borderRadius: 8 }}>{p.when}</span>
                          </span>
                          <span style={{ display: "block", marginTop: 4, fontSize: 14, lineHeight: 1.6, color: "#4A576B" }}>{p.text}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {deal.seek && (
              <div style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "flex-start", background: type.tint, borderRadius: 12, padding: "10px 12px", fontSize: 14, lineHeight: 1.45, color: type.ink }}>
                <Icon name="people" size={16} strokeWidth={2.2} style={{ flex: "none", marginTop: 2 }} />
                <span>
                  <b>Looking for:</b> {deal.seek}
                  {deal.needed_by ? ` · ${deal.needed_by}` : ""}
                </span>
              </div>
            )}
            {tags.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
                {tags.map((t) => (
                  <span key={t} className="m-tag">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </section>

          {hasNumbers && (
            <section id="num" className="x-sec">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                <div>
                  <h2 className="x-h2">The numbers</h2>
                  <p className="x-sub">{details.numbers?.length ? "Today versus after the plan. " : ""}These are the poster&apos;s estimates.</p>
                </div>
                <Link href="/tools" style={{ fontSize: 14, fontWeight: 700, color: "#DB520B" }}>
                  Check them in the calculator
                </Link>
              </div>
              {details.numbers && details.numbers.length > 0 && (
                <div className="x-table-wrap">
                  <table className="x-table" style={{ marginTop: 18 }}>
                    <thead>
                      <tr>
                        <th scope="col">Yearly</th>
                        <th scope="col">Today</th>
                        <th scope="col">After the plan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.numbers.map((r, i) => (
                        <tr key={i} className={r.highlight ? "hl" : undefined}>
                          <td>{r.highlight ? <b>{r.label}</b> : r.label}</td>
                          <td>{r.today}</td>
                          <td style={{ color: r.neutral ? undefined : "#17603F" }}>{r.after}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {details.capital_stack && (
                <>
                  <h3 className="x-h3">Where the money comes from</h3>
                  <p className="x-sub" style={{ marginTop: 0 }}>
                    Total project: {details.capital_stack.total}
                  </p>
                  <div
                    style={{ display: "flex", height: 18, borderRadius: 99, overflow: "hidden", marginTop: 14 }}
                    role="img"
                    aria-label={details.capital_stack.parts.map((p) => `${p.label} ${p.pct} percent`).join(", ")}
                  >
                    {details.capital_stack.parts.map((p) => (
                      <span key={p.label} style={{ width: `${p.pct}%`, background: p.color }} />
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 10, marginTop: 14 }}>
                    {details.capital_stack.parts.map((p) => (
                      <div key={p.label} style={{ display: "flex", gap: 10 }}>
                        <span style={{ width: 12, height: 12, borderRadius: 4, background: p.color, marginTop: 4, flex: "none" }} />
                        <span style={{ fontSize: 14, lineHeight: 1.45 }}>
                          <b style={{ display: "block" }}>
                            {p.label} · {p.amount}
                          </b>
                          <span style={{ color: "#5E6B7E" }}>
                            {p.pct}% · {p.note}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {deal.type === "equity" && scenarios.length > 0 && <ScenarioPicker scenarios={scenarios} years={details.hold_years ?? 5} />}
            </section>
          )}

          <section id="loc" className="x-sec">
            <h2 className="x-h2">Location and market</h2>
            <p className="x-sub">
              {address ? "You can see the exact address because the poster approved your request." : `Exact address is shared once ${firstName} approves your request.`}
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 18 }}>
              <div style={{ flex: "999 1 340px", position: "relative", minHeight: 300, borderRadius: 18, overflow: "hidden", background: "#EEF2F8" }}>
                <AreaMap competitors={competitors.filter((c) => !c.self).length} />
                <div style={{ position: "absolute", left: 12, bottom: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span className="d-pill">
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#0B1F3A" }} />
                    {deal.city}, {deal.state}
                  </span>
                  {competitors.some((c) => !c.self) && (
                    <span className="d-pill">
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#5E6B7E" }} />
                      Competitors
                    </span>
                  )}
                  <span className="d-pill" style={{ color: "#B5440A" }}>
                    3-mile area
                  </span>
                </div>
              </div>
              {details.market && details.market.length > 0 && (
                <div style={{ flex: "1 1 260px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, alignContent: "start" }}>
                  {details.market.map((m, i) => (
                    <div key={i} className="x-key">
                      <span>{m.l}</span>
                      <b style={{ color: m.c }}>{m.v}</b>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {!hasMarket && (
              <p className="x-sub" style={{ marginTop: 14 }}>
                {firstName} has not added market data yet. Ask about it in the questions below.
              </p>
            )}
            {competitors.length > 0 && (
              <>
                <h3 style={{ margin: "24px 0 4px", fontSize: 16, fontWeight: 800 }}>What the competition charges</h3>
                <div className="x-table-wrap">
                  <table className="x-table" style={{ marginTop: 10 }}>
                    <thead>
                      <tr>
                        <th scope="col">Nearby facility</th>
                        <th scope="col">Distance</th>
                        <th scope="col">Rent per sq ft</th>
                        <th scope="col">Occupancy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitors.map((c, i) => (
                        <tr key={i} className={c.self ? "hl" : undefined}>
                          <td>{c.self ? <b>{c.name}</b> : c.name}</td>
                          <td>{c.distance}</td>
                          <td>{c.rent}</td>
                          <td>{c.occupancy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          <section id="docs" className="x-sec">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <h2 className="x-h2">Documents</h2>
                <DocsSubtitle access={access} firstName={firstName} />
              </div>
              {deal.status === "live" && <DocsButton access={access} />}
            </div>
            <div style={{ marginTop: 14 }}>
              {docs.length === 0 && <p className="x-sub">No documents listed yet.</p>}
              {docs.map((d) => {
                const pdf = d.ext.toUpperCase() === "PDF";
                return (
                  <div key={d.id} className="x-doc">
                    <span style={{ width: 44, height: 44, borderRadius: 13, flex: "none", display: "grid", placeItems: "center", background: pdf ? "#FCE5E5" : "#DDF3E8", fontSize: 11, fontWeight: 800, color: pdf ? "#A82A2A" : "#17603F" }}>
                      {d.ext.toUpperCase()}
                    </span>
                    <span style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>
                      <b style={{ display: "block", fontSize: 15 }}>{d.name}</b>
                      <span style={{ fontSize: 13, color: "#5E6B7E" }}>{d.meta}</span>
                    </span>
                    <DocState access={access} documentId={d.id} hasFile={!!d.storage_path} />
                  </div>
                );
              })}
            </div>
          </section>

          <section id="qa" className="x-sec">
            <h2 className="x-h2">Questions from members</h2>
            <p className="x-sub">Ask in public so everyone benefits. {own ? "Answer here so every member sees it." : `${firstName} answers here.`}</p>
            {!own && <AskForm dealId={deal.id} viewer={viewer ? { name: viewer.profile.full_name, color: viewer.profile.avatar_color } : null} />}
            <div style={{ marginTop: 10 }}>
              {questions.length === 0 && (
                <p className="x-sub" style={{ marginTop: 14 }}>
                  No questions yet.{own ? "" : " Be the first to ask."}
                </p>
              )}
              {questions.map((q) => {
                const a = q.author as Author | null;
                return (
                  <div key={q.id} className="x-q">
                    <Avatar name={a?.full_name ?? "?"} color={a?.avatar_color ?? "#E6EBF3"} size={40} radius={13} fontSize={13} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontSize: 14 }}>
                        {a ? (
                          <Link href={`/u/${a.id}`} style={{ fontWeight: 800 }}>
                            {a.full_name}
                          </Link>
                        ) : (
                          <b>Former member</b>
                        )}
                        {a?.verified && <Verified size={15} label="Verified" />}
                        <span style={{ color: "#5E6B7E" }}>
                          {a?.headline ? `${a.headline} · ` : ""}
                          {timeAgo(q.created_at)}
                        </span>
                      </div>
                      <p style={{ margin: "6px 0 0", fontSize: 15, lineHeight: 1.6, color: "#1E2B3F", whiteSpace: "pre-line" }}>{q.body}</p>
                      {q.answer ? (
                        <div className="x-ans">
                          <Avatar name={poster?.full_name ?? "?"} color={poster?.avatar_color ?? "#E6EBF3"} size={34} radius={11} fontSize={12} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13 }}>
                              <b>{poster?.full_name}</b>{" "}
                              <span style={{ fontSize: 11, fontWeight: 800, color: "#17603F", background: "#DDF3E8", padding: "2px 7px", borderRadius: 6, marginLeft: 4 }}>
                                {deal.type === "equity" ? "Sponsor" : "Poster"}
                              </span>{" "}
                              <span style={{ color: "#5E6B7E" }}>· {q.answered_at ? timeAgo(q.answered_at) : ""}</span>
                            </div>
                            <p style={{ margin: "6px 0 0", fontSize: 14, lineHeight: 1.6, color: "#334155", whiteSpace: "pre-line" }}>{q.answer}</p>
                          </div>
                        </div>
                      ) : (
                        !own && (
                          <span style={{ display: "inline-block", marginTop: 10, fontSize: 12, fontWeight: 800, color: "#8A5A12", background: "#FBF1DD", padding: "4px 10px", borderRadius: 999 }}>
                            Waiting for {firstName}&apos;s answer
                          </span>
                        )
                      )}
                      <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
                        <QuestionLike questionId={q.id} likes={q.like_count} liked={liked.has(q.id)} />
                        {own && !q.answer && <AnswerForm questionId={q.id} dealId={deal.id} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>

        <aside style={{ flex: "1 1 340px", maxWidth: "100%", display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 90 }} aria-label="Act on this deal">
          {deal.status === "live" &&
            (deal.type === "equity" && deal.raise_goal ? (
              <InvestCard
                goal={deal.raise_goal}
                committed={deal.raise_committed ?? 0}
                closesNote={deal.closes_note}
                interest={deal.interest_count}
                minK={minK}
                expectedMult={expected?.mult ?? null}
                posterId={deal.poster_id}
                firstName={firstName}
              />
            ) : (
              <ActionCard
                amountLabel={type.amountLabel}
                amount={deal.amount}
                metrics={metrics.slice(1)}
                cta={type.req}
                interest={deal.interest_count}
                posterId={deal.poster_id}
                firstName={firstName}
                note={
                  deal.type === "sale"
                    ? `Requesting info is not an offer. ${firstName} decides who gets the address and documents.`
                    : deal.type === "debt"
                      ? `Offering a loan starts a private conversation. Terms are agreed directly with ${firstName}.`
                      : `Introduce yourself and what you bring. ${firstName} sees your profile before replying.`
                }
              />
            ))}

          <div className="m-card" style={{ padding: 22 }}>
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5E6B7E" }}>
              {deal.type === "equity" ? "Sponsor" : "Posted by"}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
              <Avatar name={poster?.full_name ?? "?"} color={poster?.avatar_color ?? "#E6EBF3"} size={52} radius={16} fontSize={16} />
              <span style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 17 }}>
                  {poster?.full_name ?? "Former member"}
                  {poster?.verified && <Verified label="Verified" />}
                </span>
                <span style={{ display: "block", fontSize: 13, color: "#5E6B7E" }}>{poster?.headline}</span>
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(sponsorStats.length, 3)}, 1fr)`, gap: 8, marginTop: 16, textAlign: "center" }}>
              {sponsorStats.slice(0, 3).map((s) => (
                <div key={s.l} className="x-key" style={{ padding: "10px 6px" }}>
                  <b style={{ fontSize: 18, margin: 0, color: s.c }}>{s.v}</b>
                  <span style={{ marginTop: 2 }}>{s.l}</span>
                </div>
              ))}
            </div>
            {poster?.bio && <p style={{ marginTop: 14, fontSize: 13, lineHeight: 1.55, color: "#4A576B" }}>{poster.bio}</p>}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              {!own && <FollowPersonButton personId={deal.poster_id} following={!!followRes?.data} />}
              <Link className="m-btn m-btn-s" href={`/u/${deal.poster_id}`} style={{ flex: 1 }}>
                View profile
              </Link>
            </div>
          </div>

          {threadRes.data && (
            <Link className="m-card" href={`/forums/${threadRes.data.id}`} style={{ padding: "18px 20px", display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ width: 42, height: 42, borderRadius: 13, flex: "none", display: "grid", placeItems: "center", background: "#FFEDE2" }}>
                <Icon name="chat" size={19} stroke="#DB520B" />
              </span>
              <span style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>
                <b style={{ display: "block", fontSize: 14, color: "#0F1B2D" }}>Discussed in the forum</b>
                <span style={{ fontSize: 13, color: "#5E6B7E" }}>
                  &ldquo;{threadRes.data.title}&rdquo; · {threadRes.data.reply_count} {threadRes.data.reply_count === 1 ? "reply" : "replies"}
                </span>
              </span>
              <Icon name="chevron" size={16} stroke="#5E6B7E" strokeWidth={2.2} />
            </Link>
          )}

          <div className="m-note">
            <Icon name="shieldCheck" size={22} stroke="#B5440A" style={{ flex: "none" }} />
            <span>
              <b>Do your own homework</b>
              We verify who the poster is, not the numbers. Read the documents and talk to your own advisor before you invest.
            </span>
          </div>
        </aside>
      </div>

      {(similarRes.data ?? []).length > 0 && (
        <div className="wrap" style={{ paddingBottom: 64 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
            <h2 className="x-h2">Similar deals</h2>
            <Link href={`/deals?tab=${deal.type}`} style={{ fontSize: 14, fontWeight: 700, color: "#DB520B" }}>
              See all in the Deal Room
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {(similarRes.data ?? []).map((s) => {
              const st = DEAL_TYPES[s.type];
              const sm = (s.metrics as Metric[] | null) ?? [];
              const sp = (s.photos as DealPhoto[] | null) ?? [];
              return (
                <Link key={s.id} className="x-mini" href={`/deals/${s.id}`}>
                  <div style={{ position: "relative", height: 120, background: st.tint, overflow: "hidden" }}>
                    {sp[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrl(sp[0].path)} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <DealArt type={s.property_type} height={120} />
                    )}
                    <span className="d-pill" style={{ position: "absolute", top: 12, left: 12, color: st.ink }}>
                      <span className="d-dot" style={{ background: st.dot }} />
                      {st.name}
                    </span>
                  </div>
                  <div style={{ padding: "16px 18px 18px" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#5E6B7E" }}>
                      {s.city}, {s.state}
                    </span>
                    <b style={{ display: "block", marginTop: 4, fontSize: 16, lineHeight: 1.35, color: "#0F1B2D" }}>{s.title}</b>
                    <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 13, color: "#5E6B7E", flexWrap: "wrap" }}>
                      {sm.slice(0, 2).map((m) => (
                        <span key={m.l}>
                          {m.l} {m.v}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </DealProvider>
  );
}
