import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Verified } from "@/components/Verified";
import { DealCard, type DealCardData } from "@/components/deals/DealCard";
import { ThreadCard } from "@/components/forum/ThreadCard";
import { getViewer } from "@/lib/auth";
import { DEAL_CARD_SELECT, getDealMarks } from "@/lib/queries/deals";
import { getThreadMarks, THREAD_CARD_SELECT, toCard } from "@/lib/queries/forum";
import { createClient } from "@/lib/supabase/server";
import { AUTHOR_FIELDS, type Author } from "@/lib/types";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; in?: string }> }) {
  const sp = await searchParams;
  const raw = (sp.q ?? "").trim().slice(0, 80);
  // PostgREST filter syntax treats these characters specially; plain words are all we need.
  const q = raw.replace(/[%*,()\\:"']/g, " ").replace(/\s+/g, " ").trim();
  const scope = sp.in === "deals" ? "deals" : sp.in === "people" ? "people" : "forums";
  const supabase = await createClient();
  const viewer = await getViewer();
  const like = `%${q}%`;

  const [threadsRes, dealsRes, peopleRes] = q
    ? await Promise.all([
        supabase.from("threads").select(THREAD_CARD_SELECT).or(`title.ilike.${like},body.ilike.${like}`).order("last_activity_at", { ascending: false }).limit(30),
        supabase.from("deals").select(DEAL_CARD_SELECT).eq("status", "live").or(`title.ilike.${like},city.ilike.${like},state.ilike.${like},region.ilike.${like},story.ilike.${like}`).order("created_at", { ascending: false }).limit(30),
        supabase.from("profiles").select(`${AUTHOR_FIELDS}, location`).or(`full_name.ilike.${like},headline.ilike.${like}`).limit(30),
      ])
    : [null, null, null];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const threads = (threadsRes?.data ?? []).map((r: any) => toCard(r));
  const deals = (dealsRes?.data ?? []) as unknown as DealCardData[];
  const people = (peopleRes?.data ?? []) as (Author & { location: string })[];
  const [threadMarks, dealMarks] = await Promise.all([
    getThreadMarks(supabase, viewer?.id, threads.map((t) => t.id)),
    getDealMarks(supabase, viewer?.id, deals.map((d) => d.id)),
  ]);

  const tabs = [
    { id: "forums", label: "Discussions", n: threads.length },
    { id: "deals", label: "Deals", n: deals.length },
    { id: "people", label: "People", n: people.length },
  ];

  return (
    <div className="wrap" style={{ paddingTop: 28, paddingBottom: 56, display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em" }}>{q ? `Results for “${raw}”` : "Search"}</h1>
        <p style={{ marginTop: 6, color: "#5E6B7E" }}>
          {q ? "Searching discussion titles and posts, deals by city, state and keyword, and member names." : "Type in the search box above to find discussions, deals and people."}
        </p>
      </div>
      {q && (
        <>
          <nav className="d-tabs" aria-label="Result types">
            {tabs.map((t) => (
              <Link key={t.id} className={`d-tab${t.id === scope ? " on" : ""}`} aria-current={t.id === scope ? "true" : undefined} href={`/search?q=${encodeURIComponent(raw)}&in=${t.id}`}>
                {t.label}
                <span className="d-cnt">{t.n}</span>
              </Link>
            ))}
          </nav>
          {scope === "forums" &&
            threads.map((t) => <ThreadCard key={t.id} thread={t} liked={threadMarks.liked.has(t.id)} saved={threadMarks.saved.has(t.id)} />)}
          {scope === "deals" && deals.length > 0 && (
            <div className="d-grid">
              {deals.map((d) => (
                <DealCard key={d.id} deal={d} saved={dealMarks.saved.has(d.id)} requested={dealMarks.requested.has(d.id)} viewerId={viewer?.id} />
              ))}
            </div>
          )}
          {scope === "people" && people.length > 0 && (
            <div className="d-grid">
              {people.map((p) => (
                <Link key={p.id} href={`/u/${p.id}`} className="m-card" style={{ padding: 18, display: "flex", gap: 12, alignItems: "center", color: "#0F1B2D" }}>
                  <Avatar name={p.full_name} color={p.avatar_color} size={48} radius={15} fontSize={15} />
                  <span style={{ lineHeight: 1.35, minWidth: 0 }}>
                    <span style={{ display: "flex", gap: 5, alignItems: "center", fontWeight: 800 }}>
                      {p.full_name}
                      {p.verified && <Verified size={15} />}
                    </span>
                    <span style={{ display: "block", fontSize: 13, color: "#5E6B7E" }}>{p.headline || p.location}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
          {tabs.find((t) => t.id === scope)?.n === 0 && (
            <div className="m-card m-empty">
              <b>Nothing found</b>
              <span>Try a shorter search, a city or state, or another tab.</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
