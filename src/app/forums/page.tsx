import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { EventHost, FollowCategoryButton } from "@/components/forum/FollowButton";
import { ThreadCard } from "@/components/forum/ThreadCard";
import { getViewer } from "@/lib/auth";
import { compact, count, initials } from "@/lib/format";
import { ICONS } from "@/lib/icons";
import { getCategories, getThreadMarks, getTopContributors, THREAD_CARD_SELECT, toCard } from "@/lib/queries/forum";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Forums" };

type Search = { cat?: string; tab?: string; view?: string; limit?: string };

const TABS = [
  { id: "latest", label: "Latest" },
  { id: "top", label: "Most helpful" },
  { id: "unanswered", label: "Unanswered" },
  { id: "saved", label: "Saved" },
];

const GROUPS = ["Start here", "Buy & build", "Operate", "Money & legal"];
const PAGE = 10;

function href(base: Search, patch: Partial<Search>) {
  const merged = { ...base, ...patch };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) if (v && !(k === "tab" && v === "latest")) qs.set(k, v);
  const s = qs.toString();
  return s ? `/forums?${s}` : "/forums";
}

export default async function ForumsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const tab = TABS.some((t) => t.id === sp.tab) ? sp.tab! : "latest";
  const following = sp.view === "following";
  const limit = Math.min(Math.max(Number(sp.limit) || PAGE, PAGE), 100);
  const base: Search = { cat: sp.cat, tab: sp.tab, view: sp.view };

  const supabase = await createClient();
  const viewer = await getViewer();

  const [categories, people, statsRes, followsRes, savedRes, eventRes, trendingRes, membersRes] = await Promise.all([
    getCategories(supabase),
    getTopContributors(supabase),
    supabase.rpc("community_stats"),
    viewer ? supabase.from("category_follows").select("category_id").eq("user_id", viewer.id) : null,
    viewer ? supabase.from("thread_saves").select("thread_id").eq("user_id", viewer.id) : null,
    supabase
      .from("events")
      .select("*, host:profiles!events_host_id_fkey(full_name, avatar_color), event_reminders(count)")
      .gt("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("threads")
      .select("id, title, reply_count, category:categories(name)")
      .gt("last_activity_at", new Date(Date.now() - 30 * 864e5).toISOString())
      .gt("reply_count", 0)
      .order("reply_count", { ascending: false })
      .limit(5),
    supabase.from("profiles").select("full_name, avatar_color").order("created_at", { ascending: false }).limit(4),
  ]);

  const stats = (statsRes.data ?? { members: 0, discussions: 0, active_this_week: 0 }) as {
    members: number;
    discussions: number;
    active_this_week: number;
  };
  const followedIds = (followsRes?.data ?? []).map((f) => f.category_id);
  const savedIds = (savedRes?.data ?? []).map((s) => s.thread_id);
  const cat = categories.find((c) => c.id === sp.cat);

  let query = supabase.from("threads").select(THREAD_CARD_SELECT, { count: "exact" });
  if (cat) query = query.eq("category_id", cat.id);
  if (following) query = query.in("category_id", followedIds.length ? followedIds : ["__none__"]);
  if (tab === "unanswered") query = query.eq("reply_count", 0);
  if (tab === "saved") query = query.in("id", savedIds.length ? savedIds : [-1]);
  if (tab === "top") query = query.order("like_count", { ascending: false });
  else query = query.order("pinned", { ascending: false }).order("last_activity_at", { ascending: false });
  const { data: rows, count: total, error } = await query.range(0, limit - 1);
  if (error) throw new Error(error.message);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const threads = (rows ?? []).map((r: any) => toCard(r));
  const marks = await getThreadMarks(supabase, viewer?.id, threads.map((t) => t.id));

  const active = cat
    ? { name: cat.name, desc: cat.description, color: cat.color, tint: cat.tint, icon: cat.icon }
    : following
      ? { name: "Following", desc: "Discussions in the topics you follow.", color: "#0B1F3A", tint: "#E6EBF3", icon: ICONS.heart }
      : { name: "All discussions", desc: "Every conversation across the community, newest activity first.", color: "#0B1F3A", tint: "#E6EBF3", icon: ICONS.chat };

  const event = eventRes.data;
  const reminded =
    viewer && event
      ? !!(await supabase.from("event_reminders").select("event_id").eq("event_id", event.id).eq("user_id", viewer.id).maybeSingle()).data
      : false;

  const emptyText =
    tab === "saved"
      ? ["No saved discussions yet", "Tap the bookmark on any discussion to keep it here."]
      : following && followedIds.length === 0
        ? ["You are not following any topics yet", "Pick a topic on the left and tap Follow topic."]
        : tab === "unanswered"
          ? ["Every discussion here has a reply", "Nice work, community."]
          : ["No discussions here yet", "Be the first to start one."];

  return (
    <>
      <div className="wrap" style={{ paddingTop: 24 }}>
        <section className="m-hero">
          <svg width="520" height="300" viewBox="0 0 520 300" aria-hidden="true" style={{ position: "absolute", right: -40, top: -10, opacity: 0.9 }}>
            <defs>
              <radialGradient id="mGlow" cx="0.7" cy="0.35" r="0.6">
                <stop offset="0" stopColor="#F26B1D" stopOpacity="0.45" />
                <stop offset="1" stopColor="#F26B1D" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="520" height="300" fill="url(#mGlow)" />
            <g fill="none" stroke="#ffffff" strokeOpacity="0.09" strokeWidth="2">
              <rect x="150" y="40" width="70" height="90" rx="8" />
              <rect x="232" y="40" width="70" height="90" rx="8" />
              <rect x="314" y="40" width="70" height="90" rx="8" />
              <rect x="396" y="40" width="70" height="90" rx="8" />
              <rect x="150" y="142" width="70" height="90" rx="8" />
              <rect x="232" y="142" width="70" height="90" rx="8" />
              <rect x="396" y="142" width="70" height="90" rx="8" />
              <path d="M160 60h50M160 72h50M160 84h50M242 60h50M242 72h50M324 60h50M324 72h50M324 84h50M406 60h50M160 162h50M160 174h50M242 162h50M406 162h50M406 174h50" />
            </g>
            <rect x="314" y="142" width="70" height="90" rx="8" fill="#F26B1D" fillOpacity="0.85" />
            <path d="M330 172h38M330 184h38M330 196h38" stroke="#0B1F3A" strokeOpacity="0.35" strokeWidth="2" />
          </svg>
          <div style={{ position: "relative", maxWidth: 660 }}>
            <span className="m-live">{count(stats.active_this_week)} members active this week</span>
            <h1>Self Storage Forums</h1>
            <p>Ask questions, share deals and learn from investors, operators and developers building in self storage.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 26, alignItems: "center" }}>
              <Link className="m-btn m-btn-o" href={cat ? `/forums/new?cat=${cat.id}` : "/forums/new"} style={{ minHeight: 48, padding: "0 22px" }}>
                <Icon name="plus" size={18} strokeWidth={2.4} />
                Start a discussion
              </Link>
              <Link className="m-btn m-btn-w" href="/forums/1" style={{ minHeight: 48 }}>
                Beginner&apos;s guide
              </Link>
              <span style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 8 }}>
                <span style={{ display: "flex" }}>
                  {(membersRes.data ?? []).map((m, i) => (
                    <span key={i} className="m-face" style={{ width: 32, height: 32, borderColor: "#0B1F3A", background: m.avatar_color }}>
                      {initials(m.full_name)}
                    </span>
                  ))}
                </span>
                <span style={{ fontSize: 14, color: "#C5D1E3" }}>
                  <b style={{ color: "#fff" }}>{count(stats.members)}</b> members
                </span>
              </span>
            </div>
          </div>
        </section>
      </div>

      <div className="wrap page-cols">
        <aside className="col-side" aria-label="Forum categories">
          <div className="m-card" style={{ padding: 12 }}>
            <Link className={`m-side${!cat && !following ? " on" : ""}`} href={href(base, { cat: undefined, view: undefined, limit: undefined })}>
              <span className="m-ic" style={{ background: "#EEF2F8" }}>
                <Icon name="chat" size={17} />
              </span>
              All discussions<span className="m-n">{count(stats.discussions)}</span>
            </Link>
            <Link className={`m-side${following ? " on" : ""}`} href={href(base, { cat: undefined, view: "following", limit: undefined })}>
              <span className="m-ic" style={{ background: "#EEF2F8" }}>
                <Icon name="heart" size={17} />
              </span>
              Following<span className="m-n">{followedIds.length}</span>
            </Link>
            <Link className={`m-side${tab === "saved" && !cat && !following ? " on" : ""}`} href={href({}, { tab: "saved" })}>
              <span className="m-ic" style={{ background: "#EEF2F8" }}>
                <Icon name="bookmark" size={17} />
              </span>
              Saved<span className="m-n">{savedIds.length}</span>
            </Link>
            {GROUPS.map((g) => (
              <div key={g}>
                <div className="m-sec" style={{ paddingBottom: 6 }}>
                  {g}
                </div>
                {categories
                  .filter((c) => c.group_name === g)
                  .map((c) => {
                    const on = c.id === cat?.id;
                    return (
                      <Link
                        key={c.id}
                        className={`m-side${on ? " on" : ""}`}
                        href={href(base, { cat: c.id, view: undefined, limit: undefined })}
                        aria-current={on ? "page" : undefined}
                      >
                        <span className="m-ic" style={{ background: c.tint }}>
                          <Icon d={c.icon} size={17} stroke={on ? "#FFFFFF" : c.color} />
                        </span>
                        <span style={{ minWidth: 0, lineHeight: 1.25 }}>{c.name}</span>
                        <span className="m-n">{count(c.topics)}</span>
                      </Link>
                    );
                  })}
              </div>
            ))}
          </div>
        </aside>

        <main className="col-main">
          <div className="m-card" style={{ padding: "22px 24px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <span className="m-ic" style={{ width: 52, height: 52, borderRadius: 16, background: active.tint }}>
              <Icon d={active.icon} size={24} stroke={active.color} />
            </span>
            <div style={{ flex: 1, minWidth: 220 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>{active.name}</h2>
              <p style={{ marginTop: 4, color: "#5E6B7E", fontSize: 14 }}>{active.desc}</p>
            </div>
            {cat ? (
              <FollowCategoryButton key={cat.id} categoryId={cat.id} following={followedIds.includes(cat.id)} label="Follow topic" />
            ) : (
              <Link className="m-btn m-btn-s" href="/forums/new">
                Start a discussion
              </Link>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "6px 0" }}>
            <nav className="m-seg" aria-label="Sort discussions">
              {TABS.map((t) => (
                <Link key={t.id} className={t.id === tab ? "on" : undefined} aria-current={t.id === tab ? "true" : undefined} href={href(base, { tab: t.id, limit: undefined })}>
                  {t.label}
                </Link>
              ))}
            </nav>
            <span style={{ fontSize: 13, color: "#5E6B7E", fontWeight: 600 }}>
              {count(total ?? 0)} {total === 1 ? "discussion" : "discussions"}
            </span>
          </div>

          {threads.map((t) => (
            <ThreadCard key={t.id} thread={t} liked={marks.liked.has(t.id)} saved={marks.saved.has(t.id)} />
          ))}

          {threads.length === 0 && (
            <div className="m-card m-empty">
              <b>{emptyText[0]}</b>
              <span>{emptyText[1]}</span>
            </div>
          )}

          {(total ?? 0) > threads.length && (
            <Link className="m-btn m-btn-line" href={href(base, { limit: String(limit + PAGE) })} scroll={false} style={{ alignSelf: "center", marginTop: 8 }}>
              Load more discussions
            </Link>
          )}
        </main>

        <aside className="col-rail" aria-label="Community highlights">
          {!viewer && (
            <div className="m-promo">
              <svg width="160" height="120" viewBox="0 0 160 120" aria-hidden="true" style={{ position: "absolute", right: -20, bottom: -20 }}>
                <g fill="none" stroke="#fff" strokeOpacity="0.12" strokeWidth="2">
                  <rect x="10" y="10" width="40" height="50" rx="6" />
                  <rect x="58" y="10" width="40" height="50" rx="6" />
                  <rect x="10" y="68" width="40" height="50" rx="6" />
                </g>
                <rect x="58" y="68" width="40" height="50" rx="6" fill="#F26B1D" fillOpacity="0.8" />
              </svg>
              <h3>New to self storage?</h3>
              <p style={{ maxWidth: 230 }}>Join free to ask questions, follow topics and get the best discussions every week.</p>
              <Link className="m-btn m-btn-o" href="/signup" style={{ position: "relative" }}>
                Create free account
              </Link>
            </div>
          )}

          {event && (
            <div className="m-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#B5440A" }}>Live event</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#5E6B7E" }}>
                  {new Date(event.starts_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" })} ET
                </span>
              </div>
              <h3 style={{ margin: "10px 0 0", fontSize: 17, fontWeight: 800, lineHeight: 1.35 }}>{event.title}</h3>
              <EventHost
                eventId={event.id}
                reminded={reminded}
                going={(event.event_reminders as unknown as { count: number }[])[0]?.count ?? 0}
                hostName={event.host?.full_name ?? "StorageStack"}
                hostColor={event.host?.avatar_color ?? "#E6EBF3"}
              />
            </div>
          )}

          {(trendingRes.data ?? []).length > 0 && (
            <div className="m-card" style={{ padding: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800 }}>Trending this month</h3>
              {(trendingRes.data ?? []).map((t, i) => (
                <Link key={t.id} className="m-trend" href={`/forums/${t.id}`}>
                  <span style={{ width: 28, height: 28, borderRadius: 9, background: "#F3F5F9", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800, color: "#DB520B", flex: "none" }}>
                    {i + 1}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span className="m-tt" style={{ display: "block", fontSize: 14, fontWeight: 700, lineHeight: 1.4, color: "#0F1B2D" }}>
                      {t.title}
                    </span>
                    <span style={{ display: "block", fontSize: 12, color: "#5E6B7E", marginTop: 2 }}>
                      {t.reply_count} {t.reply_count === 1 ? "reply" : "replies"} · {t.category?.name}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}

          {people.length > 0 && (
            <div className="m-card" style={{ padding: 20 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800 }}>Top contributors</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {people.map((p) => (
                  <Link key={p.id} href={`/u/${p.id}`} style={{ display: "flex", alignItems: "center", gap: 12, color: "#0F1B2D" }}>
                    <Avatar name={p.full_name} color={p.avatar_color} size={40} radius={13} fontSize={13} />
                    <span style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
                      <span style={{ display: "block", fontWeight: 800, fontSize: 14 }}>{p.full_name}</span>
                      <span style={{ display: "block", fontSize: 12, color: "#5E6B7E" }}>{p.headline}</span>
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#1E2B3F", background: "#F3F5F9", padding: "4px 9px", borderRadius: 8 }} title="Posts">
                      {compact(p.post_count)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <Link href="/guidelines" style={{ fontSize: 13, color: "#5E6B7E", padding: "0 4px" }}>
            Community guidelines
          </Link>
        </aside>
      </div>
    </>
  );
}
