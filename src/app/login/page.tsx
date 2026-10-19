import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { AuthShell } from "@/components/AuthShell";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next = "/forums", error } = await searchParams;
  return (
    <AuthShell title="Welcome back" subtitle="Pick up where you left off: your saved discussions, deals and requests.">
      <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 20 }}>Log in</h2>
      <AuthForm mode="login" next={next} linkError={error === "link"} />
    </AuthShell>
  );
}
