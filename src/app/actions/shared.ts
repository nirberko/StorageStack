import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true; id?: number } | { ok: false; error: string; needsLogin?: boolean };

export const NEEDS_LOGIN: ActionResult = { ok: false, error: "Log in to do that.", needsLogin: true };

export async function withUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export function fail(error: { message: string } | null | undefined, fallback = "Something went wrong. Please try again."): ActionResult {
  return { ok: false, error: error?.message ?? fallback };
}

/** Insert or delete a row in a membership table (likes, saves, follows...). */
export async function setMembership(
  table: string,
  match: Record<string, string | number>,
  on: boolean,
): Promise<ActionResult> {
  const { supabase, user } = await withUser();
  if (!user) return NEEDS_LOGIN;
  // The membership tables share a shape that the generated types cannot express generically.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = supabase.from(table as any) as any;
  const { error } = on ? await t.upsert(match, { ignoreDuplicates: true }) : await t.delete().match(match);
  return error ? fail(error) : { ok: true };
}
