import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { NewPasswordForm } from "@/components/ResetForms";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Choose a new password" };

/** Reached from the reset email, which signs the member in first. Without that session the link was bad or old. */
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login?error=link");
  return (
    <AuthShell title="Choose a new password" subtitle="You will stay logged in after you save it.">
      <NewPasswordForm />
    </AuthShell>
  );
}
