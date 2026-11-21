import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { FollowCategoryButton } from "@/components/forum/FollowButton";
import { ThreadCard } from "@/components/forum/ThreadCard";
import { getViewer } from "@/lib/auth";
import { TOPIC_GROUPS } from "@/lib/config";
import { compact, count } from "@/lib/format";
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
  // Sidebar links switch what you browse, so they leave the Saved list but keep the sort order.
  const browse: Search = { ...base, tab: tab === "saved" ? undefined : sp.tab };

  const supabase = await createClient();
  const viewer = await getViewer();

  const [categories, people, statsRes, followsRes, savedRes, trendingRes] = await Promise.all([
    getCategories(supabase),
    getTopContributors(supabase),
    supabase.rpc("community_stats"),
    viewer ? supabase.from("category_follows").select("category_id").eq("user_id", viewer.id) : null,
    viewer ? supabase.from("thread_saves").select("thread_id").eq("user_id", viewer.id) : null,
    supabase
      .from("threads")
      .select("id, title, reply_count, category:categories(name)")
      .gt("last_activity_at", new Date(Date.now() - 30 * 864e5).toISOString())
      .gt("reply_count", 0)
      .order("reply_count", { ascending: false })
      .limit(3),
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

  // What the member is browsing, for the phone dropdown's label.
  const currentView = cat ? cat.name : following ? "Following" : tab === "saved" ? "Saved" : "All discussions";
  const topicLinks = (
    <>
      <Link className={!cat && !following && tab !== "saved" ? "on" : undefined} href={href(browse, { cat: undefined, view: undefined, limit: undefined })}>
        All discussions<span>{count(stats.discussions)}</span>
      </Link>
      <Link className={following ? "on" : undefined} href={href(browse, { cat: undefined, view: "following", limit: undefined })}>
        Following<span>{followedIds.length}</span>
      </Link>
      <Link className={tab === "saved" && !cat && !following ? "on" : undefined} href={href({}, { tab: "saved" })}>
        Saved<span>{savedIds.length}</span>
      </Link>
      {TOPIC_GROUPS.map((g) => (
        <div key={g}>
          <h3>{g}</h3>
          {categories
            .filter((c) => c.group_name === g)
            .map((c) => {
              const on = c.id === cat?.id;
              return (
                <Link key={c.id} className={on ? "on" : undefined} href={href(browse, { cat: c.id, view: undefined, limit: undefined })} aria-current={on ? "page" : undefined}>
                  {c.name}
                  <span>{count(c.topics)}</span>
                </Link>
              );
            })}
        </div>
      ))}
    </>
  );

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
        <section className="f-hero">
          <div>
            <span className="m-live">{count(stats.active_this_week)} members active this week</span>
            <h1>Self Storage Forums</h1>
            <p>Ask questions, share deals and learn from investors, operators and developers building in self storage.</p>
          </div>
          <div className="f-hero-actions">
            <Link className="m-btn m-btn-o" href={cat ? `/forums/new?cat=${cat.id}` : "/forums/new"}>
              <Icon name="plus" size={16} strokeWidth={2.4} />
              Start a discussion
            </Link>
            <Link className="m-btn m-btn-w" href="/forums/1">
              Beginner&apos;s guide
            </Link>
          </div>
        </section>
      </div>

      <div className="wrap page-cols">
        <aside className="col-side" aria-label="Forum topics">
          {/* Phones: the same links folded into a dropdown, so the posts are not pushed below every topic. Keyed so it closes after a pick. */}
          <details className="f-pick" key={currentView}>
            <summary>
              <span>Topic</span>
              <b>{currentView}</b>
              <Icon name="chevron" size={16} />
            </summary>
            <nav className="f-side">{topicLinks}</nav>
          </details>
          <nav className="f-side f-desk">{topicLinks}</nav>
        </aside>

        <main className="col-main">
          {cat && (
            <div className="f-topic">
              <div>
                <h2>{cat.name}</h2>
                <p>{cat.description}</p>
              </div>
              <FollowCategoryButton key={cat.id} categoryId={cat.id} following={followedIds.includes(cat.id)} label="Follow topic" />
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "6px 0" }}>
            <nav className="m-seg" aria-label="Sort discussions">
              {TABS.map((t) => (
                <Link key={t.id} className={t.id === tab ? "on" : undefined} aria-current={t.id === tab ? "true" : undefined} href={href(base, { tab: t.id, limit: undefined })}>
                  {t.label}
                </Link>
              ))}
            </nav>
            <span style={{ fontSize: 13, color: "var(--subtle)" }}>
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
              <h3>New to self storage?</h3>
              <p style={{ maxWidth: 230 }}>Join free to ask questions, follow topics and get the best discussions every week.</p>
              <Link className="m-btn m-btn-o" href="/signup">
                Create free account
              </Link>
            </div>
          )}

          {(trendingRes.data ?? []).length > 0 && (
            <div className="m-card" style={{ padding: 18 }}>
              <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 600 }}>Trending this month</h3>
              {(trendingRes.data ?? []).map((t, i) => (
                <Link key={t.id} className="f-trend" href={`/forums/${t.id}`}>
                  <span className="f-n">{i + 1}</span>
                  <span style={{ minWidth: 0 }}>
                    <b>{t.title}</b>
                    <small>
                      {t.reply_count} {t.reply_count === 1 ? "reply" : "replies"} · {t.category?.name}
                    </small>
                  </span>
                </Link>
              ))}
            </div>
          )}

          {people.length > 0 && (
            <div className="m-card" style={{ padding: 18 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>Top contributors</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {people.map((p) => (
                  <Link key={p.id} href={`/u/${p.id}`} style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ink)" }}>
                    <Avatar name={p.full_name} color={p.avatar_color} photo={p.avatar_path} size={32} radius={16} fontSize={12} />
                    <span style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
                      <span style={{ display: "block", fontWeight: 600, fontSize: 14 }}>{p.full_name}</span>
                      <span style={{ display: "block", fontSize: 12, color: "var(--subtle)" }}>{p.headline}</span>
                    </span>
                    <span style={{ fontSize: 12, color: "var(--subtle)", fontVariantNumeric: "tabular-nums" }}>
                      {compact(p.post_count)} posts
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <Link href="/guidelines" style={{ fontSize: 13, color: "var(--subtle)", padding: "0 4px" }}>
            Community guidelines
          </Link>
        </aside>
      </div>
    </>
  );
}
