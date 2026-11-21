import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export type NotificationKind = "reply" | "thread_reply" | "like" | "answer" | "follow";

export type NotificationItem = {
  id: number;
  kind: NotificationKind;
  count: number;
  read_at: string | null;
  created_at: string;
  thread_id: number | null;
  reply_id: number | null;
  actor: { id: string; full_name: string; avatar_color: string; avatar_path: string | null } | null;
  thread: { title: string } | null;
};

export const NOTIFICATION_SELECT =
  "id, kind, count, read_at, created_at, thread_id, reply_id, actor:profiles!notifications_actor_id_fkey(id, full_name, avatar_color, avatar_path), thread:threads(title)";

export async function listNotifications(supabase: SupabaseClient<Database>, userId: string, limit: number) {
  const { data } = await supabase
    .from("notifications")
    .select(NOTIFICATION_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as NotificationItem[];
}

export async function countUnread(supabase: SupabaseClient<Database>, userId: string) {
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);
  return count ?? 0;
}

/**
 * What happened, as a phrase that follows the actor's name, and where it links to.
 * Folded reply notifications count replies (which may share an author); folded likes count people.
 */
export function describeNotification(n: NotificationItem): { text: string; href: string } {
  const title = n.thread?.title ? `“${n.thread.title}”` : "a discussion";
  const thread = n.thread_id ? `/forums/${n.thread_id}` : "/forums";
  const toReply = n.reply_id ? `${thread}#reply-${n.reply_id}` : `${thread}#replies`;
  const newReplies = n.count > 1 ? ` · ${n.count} new replies` : "";
  const others = n.count > 1 ? ` and ${n.count - 1} ${n.count === 2 ? "other" : "others"}` : "";

  switch (n.kind) {
    case "reply":
      return { text: `replied to your discussion ${title}${newReplies}`, href: toReply };
    case "thread_reply":
      return { text: `also replied in ${title}${newReplies}`, href: toReply };
    case "like":
      return { text: `${others} liked your discussion ${title}`.trimStart(), href: thread };
    case "answer":
      return { text: `marked your reply as the answer in ${title}`, href: n.reply_id ? toReply : thread };
    case "follow":
      return { text: "started following you", href: n.actor ? `/u/${n.actor.id}` : "/" };
    default:
      return { text: "has an update for you", href: thread };
  }
}
