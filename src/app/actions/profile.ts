"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NEEDS_LOGIN, setMembership, withUser, type ActionResult } from "@/app/actions/shared";

export type ProfileFormState = { error?: string; saved?: boolean };

export async function updateProfile(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const { supabase, user } = await withUser();
  if (!user) redirect("/login?next=/settings");

  const fullName = String(formData.get("full_name") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (fullName.length < 2) return { error: "Please enter your name." };
  if (headline.length > 80) return { error: "Keep your headline under 80 characters." };
  if (bio.length > 600) return { error: "Keep your bio under 600 characters." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, headline, location, bio })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { saved: true };
}

export async function toggleFollowPerson(personId: string, on: boolean): Promise<ActionResult> {
  const { user } = await withUser();
  if (!user) return NEEDS_LOGIN;
  if (personId === user.id) return { ok: false, error: "You cannot follow yourself." };
  return setMembership("follows", { follower_id: user.id, followee_id: personId }, on);
}
