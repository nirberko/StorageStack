import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { INTRO_CATEGORY, type ProfileFacts } from "@/lib/profileProgress";
import { toPlainText } from "@/lib/richtext";
import type { Category, Profile } from "@/lib/types";

type DB = SupabaseClient<Database>;

export type FeedId = "following" | "latest" | "replies";

type Person = { id: string; full_name: string; avatar_color: string };
type FeedCategory = Pick<Category, "id" | "name" | "tint" | "ink">;

/** One row of "Latest in the forums": the newest message in a thread and who wrote it. */
export type FeedItem = {
  key: string;
  threadId: number;
  title: string;
  replies: number;
  views: number;
  category: FeedCategory | null;
  person: Person | null;
  verb: "posted in" | "replied in" | "replied to you in";
  at: string;
  preview: string;
};

export type AskItem = { id: number; title: string; replies: number; category: Pick<Category, "id" | "name" | "tint" | "ink" | "icon"> | null };

export type Dashboard = {
  feed: FeedId;
  items: FeedItem[];
  /** False when the Following tab has nothing to follow yet. */
  followsAnything: boolean;
  ask: AskItem[];
  repliesThisWeek: number;
  pending: { count: number; dealTitle: string | null; dealId: number | null };
  alerts: number;
  savedDeals: number;
  followers: number;
  following: number;
  facts: ProfileFacts;
};

const FEED_SIZE = 5;
const PERSON = "id, full_name, avatar_color";
const FEED_CATEGORY = "id, name, tint, ink";

// The thread plus only its newest reply, so each row can show the latest message.
const THREAD_FEED_SELECT = `id, title, body, reply_count, views, created_at, author:profiles!threads_author_id_fkey(${PERSON}), category:categories(${FEED_CATEGORY}), replies(body, created_at, author:profiles!replies_author_id_fkey(${PERSON}))`;

/** Short plain-text excerpt; the row clamps it to two lines. */
function excerpt(body: string): string {
  const text = toPlainText(body);
  return text.length > 240 ? text.slice(0, 240) + "…" : text;
}

function latestThreads(supabase: DB) {
  return supabase
    .from("threads")
    .select(THREAD_FEED_SELECT)
    .order("last_activity_at", { ascending: false })
    .order("created_at", { referencedTable: "replies", ascending: false })
    .limit(1, { referencedTable: "replies" })
    .limit(FEED_SIZE);
}

type ThreadFeedRow = NonNullable<Awaited<ReturnType<typeof latestThreads>>["data"]>[number];

function threadToItem(t: ThreadFeedRow): FeedItem {
  const reply = t.replies[0];
  const base = { key: `t${t.id}`, threadId: t.id, title: t.title, replies: t.reply_count, views: t.views, category: t.category };
  return reply
    ? { ...base, person: reply.author, verb: "replied in", at: reply.created_at, preview: excerpt(reply.body) }
    : { ...base, person: t.author, verb: "posted in", at: t.created_at, preview: excerpt(t.body) };
}

/** Quote ids for a PostgREST `in` list. */
function inList(ids: string[]) {
  return `(${ids.map((id) => `"${id.replace(/"/g, "")}"`).join(",")})`;
}

/**
 * Everything the signed-in home page shows, fetched in parallel as the viewer (RLS applies).
 * `feedParam` is the `?feed=` tab; without it, Following is shown to members who follow
 * a topic or a person, and Latest to everyone else.
 */
export async function getDashboard(supabase: DB, viewer: { id: string; profile: Profile }, feedParam?: string): Promise<Dashboard> {
  const me = viewer.id;
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();

  // Started once with .then() so both the Following feed and the profile card can use the results.
  const topicFollows = supabase.from("category_follows").select("category_id").eq("user_id", me).then((r) => r);
  const peopleFollows = supabase.from("follows").select("followee_id").eq("follower_id", me).then((r) => r);

  const feedRes = Promise.all([topicFollows, peopleFollows]).then(async ([topics, people]) => {
    const topicIds = (topics.data ?? []).map((r) => r.category_id);
    const peopleIds = (people.data ?? []).map((r) => r.followee_id);
    const followsAnything = topicIds.length + peopleIds.length > 0;
    const feed: FeedId =
      feedParam === "following" || feedParam === "latest" || feedParam === "replies" ? feedParam : followsAnything ? "following" : "latest";

    let items: FeedItem[] = [];
    if (feed === "replies") {
      const { data, error } = await supabase
        .from("replies")
        .select(`id, body, created_at, author:profiles!replies_author_id_fkey(${PERSON}), thread:threads!inner(id, title, reply_count, views, author_id, category:categories(${FEED_CATEGORY}))`)
        .eq("thread.author_id", me)
        .neq("author_id", me)
        .order("created_at", { ascending: false })
        .limit(FEED_SIZE);
      if (error) throw new Error(error.message);
      items = (data ?? []).map((r) => ({
        key: `r${r.id}`,
        threadId: r.thread.id,
        title: r.thread.title,
        replies: r.thread.reply_count,
        views: r.thread.views,
        category: r.thread.category,
        person: r.author,
        verb: "replied to you in",
        at: r.created_at,
        preview: excerpt(r.body),
      }));
    } else if (feed === "latest" || followsAnything) {
      let query = latestThreads(supabase);
      if (feed === "following") {
        const or = [topicIds.length && `category_id.in.${inList(topicIds)}`, peopleIds.length && `author_id.in.${inList(peopleIds)}`].filter(Boolean);
        query = query.or(or.join(","));
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      items = (data ?? []).map(threadToItem);
    }
    return { feed, items, followsAnything };
  });

  const [feedData, topics, people, askRes, repliesWeekRes, pendingRes, alertsRes, savesRes, followersRes, myThreadsRes, dealsRes] = await Promise.all([
    feedRes,
    topicFollows,
    peopleFollows,
    // Recent questions that still need help: not solved, fewer than 3 replies, not the viewer's own.
    supabase
      .from("threads")
      .select("id, title, reply_count, category:categories(id, name, tint, ink, icon)")
      .eq("solved", false)
      .eq("pinned", false)
      .lt("reply_count", 3)
      .neq("author_id", me)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("replies")
      .select("id, thread:threads!inner(author_id)", { count: "exact", head: true })
      .eq("thread.author_id", me)
      .neq("author_id", me)
      .gte("created_at", weekAgo),
    supabase
      .from("deal_requests")
      .select("deal:deals!inner(id, title, poster_id)", { count: "exact" })
      .eq("deal.poster_id", me)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1),
    supabase.from("deal_alerts").select("id", { count: "exact", head: true }).eq("user_id", me),
    supabase.from("deal_saves").select("deal_id", { count: "exact", head: true }).eq("user_id", me),
    supabase.from("follows").select("follower_id", { count: "exact", head: true }).eq("followee_id", me),
    supabase.from("threads").select("category_id, like_count").eq("author_id", me).limit(1000),
    supabase.from("deals").select("id", { count: "exact", head: true }).eq("poster_id", me),
  ]);
  if (askRes.error) throw new Error(askRes.error.message);

  const myThreads = myThreadsRes.data ?? [];
  const p = viewer.profile;
  const latestRequest = pendingRes.data?.[0]?.deal ?? null;

  return {
    ...feedData,
    ask: (askRes.data ?? []).map((t) => ({ id: t.id, title: t.title, replies: t.reply_count, category: t.category })),
    repliesThisWeek: repliesWeekRes.count ?? 0,
    pending: { count: pendingRes.count ?? 0, dealTitle: latestRequest?.title ?? null, dealId: latestRequest?.id ?? null },
    alerts: alertsRes.count ?? 0,
    savedDeals: savesRes.count ?? 0,
    followers: followersRes.count ?? 0,
    following: (people.data ?? []).length,
    facts: {
      headline: p.headline,
      location: p.location,
      bio: p.bio,
      verified: p.verified,
      posts: p.post_count,
      introduced: myThreads.some((t) => t.category_id === INTRO_CATEGORY),
      topicsFollowed: (topics.data ?? []).length,
      alerts: alertsRes.count ?? 0,
      dealsPosted: dealsRes.count ?? 0,
      likesReceived: myThreads.reduce((n, t) => n + t.like_count, 0),
    },
  };
}
