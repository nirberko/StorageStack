import { notFound, redirect } from "next/navigation";
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

/**
 * The signed-in admin. Visitors go to log in; members who are not admins get a 404.
 * Call it from every admin page as well as the layout: layouts are not re-rendered on client navigation.
 */
export async function requireAdmin(next = "/admin") {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (!viewer.profile.is_admin) notFound();
  return viewer;
}
