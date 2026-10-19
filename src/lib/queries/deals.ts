import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { AUTHOR_FIELDS } from "@/lib/types";

type DB = SupabaseClient<Database>;

export const DEAL_CARD_SELECT = `*, poster:profiles!deals_poster_id_fkey(${AUTHOR_FIELDS})`;

/** Which of these deals the viewer has saved or sent a request for. */
export async function getDealMarks(supabase: DB, userId: string | undefined, ids: number[]) {
  if (!userId || ids.length === 0) return { saved: new Set<number>(), requested: new Set<number>() };
  const [{ data: saves }, { data: reqs }] = await Promise.all([
    supabase.from("deal_saves").select("deal_id").eq("user_id", userId).in("deal_id", ids),
    supabase.from("deal_requests").select("deal_id").eq("user_id", userId).in("deal_id", ids),
  ]);
  return {
    saved: new Set((saves ?? []).map((r) => r.deal_id)),
    requested: new Set((reqs ?? []).map((r) => r.deal_id)),
  };
}
