import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { AuthShell } from "@/components/AuthShell";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next = "/forums", error } = await searchParams;
  return (
    <AuthShell title="Welcome back" subtitle="Log in to keep the conversation going.">
      <AuthForm mode="login" next={next} linkError={error === "link"} />
    </AuthShell>
  );
}
