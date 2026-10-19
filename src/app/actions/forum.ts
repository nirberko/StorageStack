"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fail, NEEDS_LOGIN, setMembership, withUser, type ActionResult } from "@/app/actions/shared";
import { sanitizeRich, toPlainText } from "@/lib/richtext";

export async function toggleThreadLike(threadId: number, on: boolean): Promise<ActionResult> {
  const { user } = await withUser();
  if (!user) return NEEDS_LOGIN;
  return setMembership("thread_likes", { thread_id: threadId, user_id: user.id }, on);
}

export async function toggleThreadSave(threadId: number, on: boolean): Promise<ActionResult> {
  const { user } = await withUser();
  if (!user) return NEEDS_LOGIN;
  const res = await setMembership("thread_saves", { thread_id: threadId, user_id: user.id }, on);
  revalidatePath("/forums");
  return res;
}

export async function toggleCategoryFollow(categoryId: string, on: boolean): Promise<ActionResult> {
  const { user } = await withUser();
  if (!user) return NEEDS_LOGIN;
  const res = await setMembership("category_follows", { category_id: categoryId, user_id: user.id }, on);
  revalidatePath("/forums");
  return res;
}

export async function toggleEventReminder(eventId: number, on: boolean): Promise<ActionResult> {
  const { user } = await withUser();
  if (!user) return NEEDS_LOGIN;
  return setMembership("event_reminders", { event_id: eventId, user_id: user.id }, on);
}

export type ThreadFormState = { error?: string; fields?: Record<string, string> };

export async function createThread(_prev: ThreadFormState, formData: FormData): Promise<ThreadFormState> {
  const { supabase, user } = await withUser();
  if (!user) redirect("/login?next=/forums/new");

  const fields = {
    category_id: String(formData.get("category_id") ?? ""),
    title: String(formData.get("title") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    tags: String(formData.get("tags") ?? ""),
  };
  if (!fields.category_id) return { error: "Pick a topic for your discussion.", fields };
  if (fields.title.length < 8) return { error: "Give your discussion a title of at least 8 characters.", fields };
  const body = fields.body ? sanitizeRich(fields.body) : "";
  if (!toPlainText(body)) return { error: "Add some details so people can help.", fields };
  if (body.length > 20000) return { error: "Your post is too long. Please shorten it a little.", fields };

  const tags = fields.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 4);

  const { data, error } = await supabase
    .from("threads")
    .insert({ category_id: fields.category_id, author_id: user.id, title: fields.title, body, tags })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message ?? "Could not post your discussion.", fields };

  revalidatePath("/forums");
  redirect(`/forums/${data.id}`);
}

export async function createReply(threadId: number, body: string): Promise<ActionResult> {
  const { supabase, user } = await withUser();
  if (!user) return NEEDS_LOGIN;
  const text = body.trim();
  if (!text) return { ok: false, error: "Write a reply first." };

  const { data, error } = await supabase
    .from("replies")
    .insert({ thread_id: threadId, author_id: user.id, body: text })
    .select("id")
    .single();
  if (error) return fail(error);
  revalidatePath(`/forums/${threadId}`);
  return { ok: true, id: data.id };
}

export async function deleteReply(replyId: number, threadId: number): Promise<ActionResult> {
  const { supabase, user } = await withUser();
  if (!user) return NEEDS_LOGIN;
  const { error } = await supabase.from("replies").delete().eq("id", replyId).eq("author_id", user.id);
  if (error) return fail(error);
  revalidatePath(`/forums/${threadId}`);
  return { ok: true };
}

export async function markAnswer(replyId: number, threadId: number, isAnswer: boolean): Promise<ActionResult> {
  const { supabase, user } = await withUser();
  if (!user) return NEEDS_LOGIN;
  const { error } = await supabase.rpc("mark_answer", { p_reply_id: replyId, p_is_answer: isAnswer });
  if (error) return fail(error);
  revalidatePath(`/forums/${threadId}`);
  return { ok: true };
}

export async function deleteThread(threadId: number): Promise<ActionResult> {
  const { supabase, user } = await withUser();
  if (!user) return NEEDS_LOGIN;
  const { error } = await supabase.from("threads").delete().eq("id", threadId).eq("author_id", user.id);
  if (error) return fail(error);
  revalidatePath("/forums");
  redirect("/forums");
}
