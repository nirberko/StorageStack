"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { withUser } from "@/app/actions/shared";

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
