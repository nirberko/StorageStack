import Link from "next/link";
import { Icon } from "@/components/Icon";
import { DealCard, type DealCardData } from "@/components/deals/DealCard";
import { ThreadCard } from "@/components/forum/ThreadCard";
import { getViewer } from "@/lib/auth";
import { count, money } from "@/lib/format";
import { DEAL_CARD_SELECT, getDealMarks } from "@/lib/queries/deals";
import { getCategories, getThreadMarks, THREAD_CARD_SELECT, toCard } from "@/lib/queries/forum";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const viewer = await getViewer();

  const [threadsRes, dealsRes, categories, communityRes, dealStatsRes] = await Promise.all([
    supabase.from("threads").select(THREAD_CARD_SELECT).order("last_activity_at", { ascending: false }).limit(4),
    supabase.from("deals").select(DEAL_CARD_SELECT).eq("status", "live").order("created_at", { ascending: false }).limit(2),
    getCategories(supabase),
    supabase.rpc("community_stats"),
    supabase.rpc("deal_room_stats"),
  ]);
  if (threadsRes.error) throw new Error(threadsRes.error.message);
  if (dealsRes.error) throw new Error(dealsRes.error.message);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const threads = (threadsRes.data ?? []).map((r: any) => toCard(r));
  const deals = (dealsRes.data ?? []) as unknown as DealCardData[];
  const [threadMarks, dealMarks] = await Promise.all([
    getThreadMarks(supabase, viewer?.id, threads.map((t) => t.id)),
    getDealMarks(supabase, viewer?.id, deals.map((d) => d.id)),
  ]);
  const community = (communityRes.data ?? { members: 0, discussions: 0 }) as { members: number; discussions: number };
  const dealStats = (dealStatsRes.data ?? { active: 0, total_value: 0 }) as { active: number; total_value: number };

  return (
    <>
      <div className="wrap" style={{ paddingTop: 24 }}>
        <section className="m-hero" style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center" }}>
          <svg width="520" height="300" viewBox="0 0 520 300" aria-hidden="true" style={{ position: "absolute", right: -40, top: -10, opacity: 0.9 }}>
            <defs>
              <radialGradient id="hGlow" cx="0.7" cy="0.35" r="0.6">
                <stop offset="0" stopColor="#F26B1D" stopOpacity="0.45" />
                <stop offset="1" stopColor="#F26B1D" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="520" height="300" fill="url(#hGlow)" />
          </svg>
          <div style={{ position: "relative", flex: "1 1 480px", maxWidth: 680 }}>
            <span className="m-live">{count(community.members)} investors, operators and developers</span>
            <h1>The self storage community</h1>
            <p>Learn from people who have bought, built and run storage facilities. Then find your next deal, investor or partner in the Deal Room.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 26 }}>
              <Link className="m-btn m-btn-o" href={viewer ? "/forums/new" : "/signup"} style={{ minHeight: 48, padding: "0 22px" }}>
                {viewer ? (
                  <>
                    <Icon name="plus" size={18} strokeWidth={2.4} />
                    Start a discussion
                  </>
                ) : (
                  "Join free"
                )}
              </Link>
              <Link className="m-btn m-btn-w" href="/deals" style={{ minHeight: 48 }}>
                Browse the Deal Room
              </Link>
            </div>
          </div>
          <div style={{ position: "relative", flex: "0 1 380px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Link href="/forums" className="d-stat" style={{ color: "#fff" }}>
              <b>{count(community.discussions)}</b>
              <span>Discussions</span>
            </Link>
            <Link href="/deals" className="d-stat" style={{ color: "#fff" }}>
              <b>{count(dealStats.active)}</b>
              <span>Active deals</span>
            </Link>
            <Link href="/deals" className="d-stat" style={{ color: "#fff", gridColumn: "1 / -1" }}>
              <b style={{ color: "#FFB98E" }}>{money(Number(dealStats.total_value))}</b>
              <span>Deal value posted by members</span>
            </Link>
          </div>
        </section>
      </div>

      <div className="wrap page-cols">
        <main className="col-main" style={{ flexBasis: 640 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <h2 className="x-h2">Latest from the forums</h2>
            <Link href="/forums" style={{ fontSize: 14, fontWeight: 700, color: "#DB520B" }}>
              See all discussions
            </Link>
          </div>
          {threads.map((t) => (
            <ThreadCard key={t.id} thread={t} liked={threadMarks.liked.has(t.id)} saved={threadMarks.saved.has(t.id)} />
          ))}
        </main>

        <aside className="col-rail" style={{ flexBasis: 380 }} aria-label="New in the Deal Room">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <h2 className="x-h2">New in the Deal Room</h2>
            <Link href="/deals" style={{ fontSize: 14, fontWeight: 700, color: "#DB520B" }}>
              See all
            </Link>
          </div>
          {deals.map((d) => (
            <DealCard key={d.id} deal={d} saved={dealMarks.saved.has(d.id)} requested={dealMarks.requested.has(d.id)} viewerId={viewer?.id} />
          ))}
          <div className="m-card" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800 }}>Popular topics</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[...categories]
                .sort((a, b) => b.topics - a.topics)
                .slice(0, 8)
                .map((c) => (
                  <Link key={c.id} href={`/forums?cat=${c.id}`} className="m-badge" style={{ fontWeight: 700, color: c.ink, background: c.tint }}>
                    <Icon d={c.icon} size={13} strokeWidth={2.4} />
                    {c.name}
                  </Link>
                ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
