import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** The signed-in member and their profile, fetched once per request. */
export const getViewer = cache(async (): Promise<{ id: string; email: string; profile: Profile } | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return null;
  return { id: user.id, email: user.email ?? "", profile };
});
