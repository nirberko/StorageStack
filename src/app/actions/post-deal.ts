"use server";

import { revalidatePath } from "next/cache";
import { NEEDS_LOGIN, withUser, type ActionResult } from "@/app/actions/shared";
import { DOC_SLOTS, extOf, toDealRecord, validateStep, type Draft } from "@/components/deals/wizard/model";
import { DEAL_TYPE_IDS, PROPERTY_TYPES } from "@/lib/config";

export async function publishDeal(draft: Draft): Promise<ActionResult> {
  const { supabase, user } = await withUser();
  if (!user) return NEEDS_LOGIN;

  if (!DEAL_TYPE_IDS.includes(draft.type) || !PROPERTY_TYPES.some((p) => p.id === draft.prop)) {
    return { ok: false, error: "Pick a deal type and a property type." };
  }
  for (const step of [2, 3]) {
    const errors = Object.values(validateStep(draft, step));
    if (errors.length) return { ok: false, error: errors[0] };
  }

  // Uploads must sit in the member's own storage folder.
  const own = (path: string) => typeof path === "string" && path.startsWith(`${user.id}/`) && !path.includes("..");
  const photos = (draft.photos ?? []).filter((p) => own(p.path)).slice(0, 20);
  const record = toDealRecord({ ...draft, photos });

  const { data: deal, error } = await supabase
    .from("deals")
    .insert({ ...record, poster_id: user.id })
    .select("id")
    .single();
  if (error || !deal) return { ok: false, error: error?.message ?? "Could not post your deal." };

  const slots = DOC_SLOTS(draft.type);
  const docs = slots
    .filter((s) => draft.docs?.[s.id] && own(draft.docs[s.id].path))
    .map((s) => ({
      deal_id: deal.id,
      name: s.name,
      ext: extOf(draft.docs[s.id].name),
      meta: s.meta.replace(/^Optional\.? ?/, "") || "Shared after approval",
      storage_path: draft.docs[s.id].path,
    }));

  const [privateRes, docsRes] = await Promise.all([
    supabase.from("deal_private").insert({ deal_id: deal.id, address: draft.address.trim().slice(0, 300) }),
    docs.length ? supabase.from("deal_documents").insert(docs) : Promise.resolve({ error: null }),
  ]);
  const followUp = privateRes.error ?? docsRes.error;
  if (followUp) {
    // Posting is all-or-nothing.
    await supabase.from("deals").delete().eq("id", deal.id);
    return { ok: false, error: followUp.message };
  }

  revalidatePath("/deals");
  revalidatePath("/deals/mine");
  return { ok: true, id: deal.id };
}
