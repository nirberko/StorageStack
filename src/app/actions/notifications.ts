"use server";

import { revalidatePath } from "next/cache";
import { fail, NEEDS_LOGIN, withUser, type ActionResult } from "@/app/actions/shared";
import { countUnread, listNotifications, type NotificationItem } from "@/lib/notifications";

/** The latest notifications for the header bell, and how many are unread. */
export async function getRecentNotifications(): Promise<{ items: NotificationItem[]; unread: number } | null> {
  const { supabase, user } = await withUser();
  if (!user) return null;
  const [items, unread] = await Promise.all([listNotifications(supabase, user.id, 8), countUnread(supabase, user.id)]);
  return { items, unread };
}

/** Mark these notifications read, or all of them when no ids are given. */
export async function markNotificationsRead(ids?: number[]): Promise<ActionResult> {
  const { supabase, user } = await withUser();
  if (!user) return NEEDS_LOGIN;
  let q = supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
  if (ids) {
    if (ids.length === 0) return { ok: true };
    q = q.in("id", ids);
  }
  const { error } = await q;
  if (error) return fail(error);
  revalidatePath("/notifications");
  return { ok: true };
}

/** Form action for the "Mark all as read" button on the notifications page. */
export async function markAllNotificationsRead(): Promise<void> {
  await markNotificationsRead();
}
