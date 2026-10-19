"use server";

import { revalidatePath } from "next/cache";
import { fail, NEEDS_LOGIN, setMembership, withUser, type ActionResult } from "@/app/actions/shared";

export async function toggleDealSave(dealId: number, on: boolean): Promise<ActionResult> {
  const { user } = await withUser();
  if (!user) return NEEDS_LOGIN;
  const res = await setMembership("deal_saves", { deal_id: dealId, user_id: user.id }, on);
  revalidatePath("/deals");
  return res;
}

/** "Request info" / "I'm interested" / "Introduce myself" / "Offer a loan". */
export async function toggleDealRequest(dealId: number, on: boolean, message = "", amount?: number): Promise<ActionResult> {
  const { supabase, user } = await withUser();
  if (!user) return NEEDS_LOGIN;
  const { data: deal } = await supabase.from("deals").select("poster_id").eq("id", dealId).single();
  if (deal?.poster_id === user.id) return { ok: false, error: "This is your own deal." };

  const { error } = on
    ? await supabase.from("deal_requests").upsert({ deal_id: dealId, user_id: user.id, message, amount: amount ?? null }, { ignoreDuplicates: true })
    : await supabase.from("deal_requests").delete().match({ deal_id: dealId, user_id: user.id });
  if (error) return fail(error);
  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/deals/mine");
  return { ok: true };
}

export async function togglePartnerConnect(partnerId: string, on: boolean): Promise<ActionResult> {
  const { user } = await withUser();
  if (!user) return NEEDS_LOGIN;
  if (partnerId === user.id) return { ok: false, error: "That is you." };
  return setMembership("partner_connections", { partner_id: partnerId, user_id: user.id }, on);
}

export async function toggleQuestionLike(questionId: number, on: boolean): Promise<ActionResult> {
  const { user } = await withUser();
  if (!user) return NEEDS_LOGIN;
  return setMembership("question_likes", { question_id: questionId, user_id: user.id }, on);
}

export async function toggleFollowPerson(personId: string, on: boolean): Promise<ActionResult> {
  const { user } = await withUser();
  if (!user) return NEEDS_LOGIN;
  if (personId === user.id) return { ok: false, error: "You cannot follow yourself." };
  return setMembership("follows", { follower_id: user.id, followee_id: personId }, on);
}
