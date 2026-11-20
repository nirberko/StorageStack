"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

/** Only allow redirects back into this site. */
function safeNext(next: FormDataEntryValue | null): string {
  const value = typeof next === "string" ? next : "";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/forums";
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  });
  if (error) return { error: "That email and password do not match. Try again or reset your password." };

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const headline = String(formData.get("headline") ?? "").trim();

  if (fullName.length < 2) return { error: "Please enter your name." };
  if (password.length < 8) return { error: "Use at least 8 characters for your password." };

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, headline },
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(safeNext(formData.get("next")))}`,
    },
  });
  if (error) return { error: error.message };

  // With email confirmation on, there is no session until the member clicks the link.
  if (!data.session) return { message: `Check ${email} for a link to confirm your account.` };

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

/** Sends the member to Google. Google returns them to /auth/confirm with a code, which signs them in (and creates the account on the first visit). */
export async function signInWithGoogle(formData: FormData) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(safeNext(formData.get("next")))}`,
      queryParams: { prompt: "select_account" },
    },
  });
  redirect(error || !data.url ? "/login?error=google" : data.url);
}

/** Emails a link that signs the member in and opens the page for choosing a new password. Always says the same thing, so it never reveals who has an account. */
export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email.includes("@")) return { error: "Enter the email you signed up with." };
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/confirm?next=/reset-password` });
  return { message: `If ${email} has an account, a link to reset the password is on its way.` };
}

/** Sets a new password for the member signed in by the reset link. */
export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Use at least 8 characters for your password." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "That reset link has expired. Ask for a new one." };
  revalidatePath("/", "layout");
  redirect("/forums");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
