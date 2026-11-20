import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { INTRO_CATEGORY, type ProfileFacts } from "@/lib/profileProgress";
import type { Category, Profile } from "@/lib/types";

type DB = SupabaseClient<Database>;

export type AskItem = { id: number; title: string; replies: number; category: Pick<Category, "id" | "name" | "tint" | "ink" | "icon"> | null };

export type Dashboard = {
  ask: AskItem[];
  repliesThisWeek: number;
  followers: number;
  following: number;
  facts: ProfileFacts;
};

/** Everything the signed-in home page shows, fetched in parallel as the viewer (RLS applies). */
export async function getDashboard(supabase: DB, viewer: { id: string; profile: Profile }): Promise<Dashboard> {
  const me = viewer.id;
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();

  const [topics, people, askRes, repliesWeekRes, followersRes, myThreadsRes] = await Promise.all([
    supabase.from("category_follows").select("category_id").eq("user_id", me),
    supabase.from("follows").select("followee_id").eq("follower_id", me),
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
    supabase.from("follows").select("follower_id", { count: "exact", head: true }).eq("followee_id", me),
    supabase.from("threads").select("category_id, like_count").eq("author_id", me).limit(1000),
  ]);
  if (askRes.error) throw new Error(askRes.error.message);

  const myThreads = myThreadsRes.data ?? [];
  const p = viewer.profile;

  return {
    ask: (askRes.data ?? []).map((t) => ({ id: t.id, title: t.title, replies: t.reply_count, category: t.category })),
    repliesThisWeek: repliesWeekRes.count ?? 0,
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
      likesReceived: myThreads.reduce((n, t) => n + t.like_count, 0),
    },
  };
}
