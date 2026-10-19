"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fail, NEEDS_LOGIN, setMembership, withUser, type ActionResult } from "@/app/actions/shared";
import { DEAL_TYPE_IDS, DEAL_TYPES, PROPERTY_TYPES, REGIONS } from "@/lib/config";
import type { DealType, PropertyType } from "@/lib/types";

// ---- Deal page ---------------------------------------------------------------

export async function askQuestion(dealId: number, body: string): Promise<ActionResult> {
  const { supabase, user } = await withUser();
  if (!user) return NEEDS_LOGIN;
  const text = body.trim();
  if (text.length < 3) return { ok: false, error: "Write your question first." };
  const { data, error } = await supabase.from("deal_questions").insert({ deal_id: dealId, author_id: user.id, body: text }).select("id").single();
  if (error) return fail(error);
  revalidatePath(`/deals/${dealId}`);
  return { ok: true, id: data.id };
}

export async function answerQuestion(questionId: number, dealId: number, answer: string): Promise<ActionResult> {
  const { supabase, user } = await withUser();
  if (!user) return NEEDS_LOGIN;
  const text = answer.trim();
  if (!text) return { ok: false, error: "Write an answer first." };
  const { data, error } = await supabase
    .from("deal_questions")
    .update({ answer: text, answered_at: new Date().toISOString() })
    .eq("id", questionId)
    .select("id");
  if (error) return fail(error);
  if (!data?.length) return { ok: false, error: "Only the person who posted the deal can answer." };
  revalidatePath(`/deals/${dealId}`);
  return { ok: true };
}

export async function reportDeal(dealId: number, on: boolean): Promise<ActionResult> {
  const { user } = await withUser();
  if (!user) return NEEDS_LOGIN;
  return setMembership("deal_reports", { deal_id: dealId, user_id: user.id }, on);
}

/** A short-lived link to a private deal document. Storage policies decide who may read it. */
export async function getDocumentUrl(documentId: number): Promise<{ url?: string; error?: string }> {
  const { supabase, user } = await withUser();
  if (!user) return { error: "Log in to download documents." };
  const { data: doc } = await supabase.from("deal_documents").select("storage_path").eq("id", documentId).single();
  if (!doc?.storage_path) return { error: "This file has not been uploaded yet." };
  const { data, error } = await supabase.storage.from("deal-docs").createSignedUrl(doc.storage_path, 60);
  if (error || !data) return { error: "You do not have access to this file yet." };
  return { url: data.signedUrl };
}

// ---- My deals ----------------------------------------------------------------

export async function decideRequest(dealId: number, userId: string, status: "approved" | "declined" | "pending") {
  const { supabase, user } = await withUser();
  if (!user) redirect("/login?next=/deals/mine");
  await supabase.from("deal_requests").update({ status }).match({ deal_id: dealId, user_id: userId });
  revalidatePath("/deals/mine");
  revalidatePath(`/deals/${dealId}`);
}

export async function setDealStatus(dealId: number, status: "live" | "closed") {
  const { supabase, user } = await withUser();
  if (!user) redirect("/login?next=/deals/mine");
  await supabase
    .from("deals")
    .update({ status, closed_at: status === "closed" ? new Date().toISOString() : null })
    .eq("id", dealId)
    .eq("poster_id", user.id);
  revalidatePath("/deals/mine");
  revalidatePath("/deals");
  revalidatePath(`/deals/${dealId}`);
}

export async function withdrawRequest(dealId: number) {
  const { supabase, user } = await withUser();
  if (!user) redirect("/login?next=/deals/mine");
  await supabase.from("deal_requests").delete().match({ deal_id: dealId, user_id: user.id });
  revalidatePath("/deals/mine");
  revalidatePath(`/deals/${dealId}`);
}

// ---- Deal alerts -------------------------------------------------------------

export type FormState = { error?: string; ok?: boolean };

export async function createAlert(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, user } = await withUser();
  if (!user) redirect("/login?next=/deals/alerts");

  const dealType = String(formData.get("deal_type") ?? "");
  const propertyType = String(formData.get("property_type") ?? "");
  const region = String(formData.get("region") ?? "");
  const maxRaw = String(formData.get("max_amount") ?? "").replace(/[^0-9.]/g, "");
  const max = maxRaw ? Number(maxRaw) : null;

  const parts = [
    REGIONS.includes(region) ? region : "",
    max ? `Under $${max >= 1_000_000 ? Math.round(max / 100_000) / 10 + "M" : Math.round(max / 1000) + "k"}` : "",
    DEAL_TYPE_IDS.includes(dealType as DealType) ? DEAL_TYPES[dealType as DealType].name : "",
    PROPERTY_TYPES.find((p) => p.id === propertyType)?.name ?? "",
  ];
  const label = String(formData.get("label") ?? "").trim() || parts.filter(Boolean).join(" · ") || "Any new deal";

  const { error } = await supabase.from("deal_alerts").insert({
    user_id: user.id,
    label,
    deal_type: DEAL_TYPE_IDS.includes(dealType as DealType) ? (dealType as DealType) : null,
    property_type: PROPERTY_TYPES.some((p) => p.id === propertyType) ? (propertyType as PropertyType) : null,
    region: REGIONS.includes(region) ? region : null,
    max_amount: max && max > 0 ? max : null,
  });
  if (error) return { error: error.message };
  revalidatePath("/deals/alerts");
  revalidatePath("/deals");
  return { ok: true };
}

export async function deleteAlert(alertId: number) {
  const { supabase, user } = await withUser();
  if (!user) redirect("/login?next=/deals/alerts");
  await supabase.from("deal_alerts").delete().eq("id", alertId).eq("user_id", user.id);
  revalidatePath("/deals/alerts");
  revalidatePath("/deals");
}

// ---- Capital partner profile -------------------------------------------------

const KINDS = ["Investor", "Lender", "Operator", "Family office"];

export async function savePartnerProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, user } = await withUser();
  if (!user) redirect("/login?next=/deals/partners/join");

  const kind = String(formData.get("kind") ?? "");
  const offer = String(formData.get("offer") ?? "").trim();
  if (!KINDS.includes(kind)) return { error: "Pick what kind of partner you are." };
  if (!offer) return { error: "Say how much you invest, lend or bring." };

  const row = {
    profile_id: user.id,
    kind,
    offer_label: String(formData.get("offer_label") ?? "").trim() || (kind === "Lender" ? "Lends" : kind === "Operator" ? "Brings" : "Invests"),
    offer,
    about: String(formData.get("about") ?? "").trim(),
    focus: String(formData.get("focus") ?? "")
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean)
      .slice(0, 5),
    track_record: String(formData.get("track_record") ?? "").trim(),
    reply_time: String(formData.get("reply_time") ?? "").trim() || "Usually replies within a day",
    active: true,
  };
  const { error } = await supabase.from("capital_partners").upsert(row);
  if (error) return { error: error.message };
  revalidatePath("/deals");
  redirect("/deals?tab=partners");
}

export async function leavePartners() {
  const { supabase, user } = await withUser();
  if (!user) redirect("/login?next=/deals/partners/join");
  await supabase.from("capital_partners").delete().eq("profile_id", user.id);
  revalidatePath("/deals");
  redirect("/deals?tab=partners");
}
