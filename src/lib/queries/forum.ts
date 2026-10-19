import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { ThreadCardData } from "@/components/forum/ThreadCard";
import { AUTHOR_FIELDS, type Author, type Category } from "@/lib/types";

type DB = SupabaseClient<Database>;

export const THREAD_CARD_SELECT = `*, author:profiles!threads_author_id_fkey(${AUTHOR_FIELDS}), category:categories(*), replies(created_at, author:profiles!replies_author_id_fkey(full_name, avatar_color))`;

type RawThread = Omit<ThreadCardData, "repliers"> & {
  replies: { created_at: string; author: { full_name: string; avatar_color: string } | null }[];
};

/** Shape a thread row (with embedded replies) into card data with up to 3 distinct recent repliers. */
export function toCard(raw: RawThread): ThreadCardData {
  const seen = new Set<string>();
  const repliers: { name: string; color: string }[] = [];
  for (const r of [...(raw.replies ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at))) {
    if (!r.author || seen.has(r.author.full_name)) continue;
    seen.add(r.author.full_name);
    repliers.push({ name: r.author.full_name, color: r.author.avatar_color });
    if (repliers.length === 3) break;
  }
  const { replies: _replies, ...rest } = raw;
  return { ...rest, repliers };
}

export async function getCategories(supabase: DB): Promise<(Category & { topics: number })[]> {
  const [{ data: cats }, { data: counts }] = await Promise.all([
    supabase.from("categories").select("*").order("sort"),
    supabase.from("category_counts").select("*"),
  ]);
  const byId = new Map((counts ?? []).map((c) => [c.category_id, c.topics ?? 0]));
  return (cats ?? []).map((c) => ({ ...c, topics: byId.get(c.id) ?? 0 }));
}

/** Which of these threads the viewer has liked and saved. */
export async function getThreadMarks(supabase: DB, userId: string | undefined, ids: number[]) {
  if (!userId || ids.length === 0) return { liked: new Set<number>(), saved: new Set<number>() };
  const [{ data: likes }, { data: saves }] = await Promise.all([
    supabase.from("thread_likes").select("thread_id").eq("user_id", userId).in("thread_id", ids),
    supabase.from("thread_saves").select("thread_id").eq("user_id", userId).in("thread_id", ids),
  ]);
  return {
    liked: new Set((likes ?? []).map((r) => r.thread_id)),
    saved: new Set((saves ?? []).map((r) => r.thread_id)),
  };
}

export async function getTopContributors(supabase: DB, limit = 5) {
  const { data } = await supabase
    .from("profiles")
    .select(`${AUTHOR_FIELDS}, post_count`)
    .gt("post_count", 0)
    .order("post_count", { ascending: false })
    .limit(limit);
  return (data ?? []) as (Author & { post_count: number })[];
}
