"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fail, type ActionResult } from "@/app/actions/shared";
import { getViewer } from "@/lib/auth";
import { TOPIC_COLORS, TOPIC_GROUPS, TOPIC_ICONS } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

// Every admin function also checks is_admin() in Postgres; this check just gives a clear message early.
const DENIED: ActionResult = { ok: false, error: "Only admins can do that." };

async function adminClient() {
  const viewer = await getViewer();
  return viewer?.profile.is_admin ? createClient() : null;
}

// Members ----------------------------------------------------------------------

export async function updateMember(
  userId: string,
  patch: { verified?: boolean; is_moderator?: boolean; is_admin?: boolean },
): Promise<ActionResult> {
  const supabase = await adminClient();
  if (!supabase) return DENIED;
  const { error } = await supabase.rpc("admin_update_member", {
    p_user_id: userId,
    p_verified: patch.verified,
    p_is_moderator: patch.is_moderator,
    p_is_admin: patch.is_admin,
  });
  if (error) return fail(error);
  revalidatePath("/admin/members");
  revalidatePath(`/u/${userId}`);
  return { ok: true };
}

export async function setMemberSuspended(userId: string, suspended: boolean): Promise<ActionResult> {
  const supabase = await adminClient();
  if (!supabase) return DENIED;
  const { error } = await supabase.rpc("admin_set_suspended", { p_user_id: userId, p_suspended: suspended });
  if (error) return fail(error);
  revalidatePath("/admin/members");
  return { ok: true };
}

export async function deleteMember(userId: string): Promise<ActionResult> {
  const supabase = await adminClient();
  if (!supabase) return DENIED;
  const { error } = await supabase.rpc("admin_delete_member", { p_user_id: userId });
  if (error) return fail(error);
  revalidatePath("/", "layout");
  return { ok: true };
}

// Topics -----------------------------------------------------------------------

export type TopicFormState = { error?: string; saved?: boolean };

const TOPIC_ID = /^[a-z0-9][a-z0-9-]{1,29}$/;

export async function saveTopic(_prev: TopicFormState, formData: FormData): Promise<TopicFormState> {
  const supabase = await adminClient();
  if (!supabase) return { error: "Only admins can do that." };

  const original = String(formData.get("original_id") ?? "");
  const id = original || String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const group = String(formData.get("group_name") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const color = TOPIC_COLORS.find((c) => c.name === formData.get("color"));
  const icon = String(formData.get("icon") ?? "");

  if (name.length < 2 || name.length > 40) return { error: "Give the topic a name of 2 to 40 characters." };
  if (!TOPIC_ID.test(id)) return { error: "The link name can use lowercase letters, numbers and dashes (2 to 30 characters)." };
  if (!TOPIC_GROUPS.includes(group)) return { error: "Pick a section for the topic." };
  if (description.length > 160) return { error: "Keep the description under 160 characters." };
  if (!color) return { error: "Pick a color." };

  const { data: cats, error: listError } = await supabase.from("categories").select("id, group_name, sort, icon");
  if (listError) return { error: listError.message };
  const existing = cats.find((c) => c.id === id);
  // Keep a custom icon set outside the panel, but only offer the standard set otherwise.
  if (!TOPIC_ICONS.some((i) => i.d === icon) && !(original && existing?.icon === icon)) return { error: "Pick an icon." };

  const fields = { name, group_name: group, description, color: color.color, tint: color.tint, ink: color.ink, icon };
  const nextSort = Math.max(0, ...cats.map((c) => c.sort)) + 1;

  if (original) {
    if (!existing) return { error: "This topic no longer exists." };
    const sort = existing.group_name === group ? existing.sort : nextSort;
    const { error } = await supabase.from("categories").update({ ...fields, sort }).eq("id", id);
    if (error) return { error: error.message };
  } else {
    if (existing) return { error: `The link name "${id}" is already used by another topic.` };
    const { error } = await supabase.from("categories").insert({ id, ...fields, sort: nextSort });
    if (error) return { error: error.message };
  }

  revalidatePath("/", "layout");
  if (!original) redirect("/admin/topics");
  return { saved: true };
}

/** Move a topic up (-1) or down (1) within its section. */
export async function moveTopic(id: string, dir: -1 | 1): Promise<ActionResult> {
  const supabase = await adminClient();
  if (!supabase) return DENIED;

  const { data: cats, error } = await supabase.from("categories").select("id, group_name, sort").order("sort").order("id");
  if (error) return fail(error);
  const target = cats.find((c) => c.id === id);
  if (!target) return { ok: false, error: "This topic no longer exists." };

  const sections = TOPIC_GROUPS.map((g) => cats.filter((c) => c.group_name === g));
  const other = cats.filter((c) => !TOPIC_GROUPS.includes(c.group_name));
  const section = sections[TOPIC_GROUPS.indexOf(target.group_name)] ?? other;
  const i = section.indexOf(target);
  const j = i + dir;
  if (j < 0 || j >= section.length) return { ok: true };
  [section[i], section[j]] = [section[j], section[i]];

  // Renumber everything so ties and gaps from older data cannot block a move.
  const ordered = [...sections.flat(), ...other];
  for (const [n, c] of ordered.entries()) {
    if (c.sort === n + 1) continue;
    const { error: updateError } = await supabase.from("categories").update({ sort: n + 1 }).eq("id", c.id);
    if (updateError) return fail(updateError);
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteTopic(id: string, moveTo: string | null): Promise<ActionResult> {
  const supabase = await adminClient();
  if (!supabase) return DENIED;
  const { error } = await supabase.rpc("admin_delete_category", { p_id: id, p_move_to: moveTo ?? undefined });
  if (error) return fail(error);
  revalidatePath("/", "layout");
  redirect("/admin/topics");
}
