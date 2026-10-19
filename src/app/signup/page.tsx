import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { AuthShell } from "@/components/AuthShell";

export const metadata: Metadata = { title: "Join free" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/forums" } = await searchParams;
  return (
    <AuthShell
      title="Join StorageStack"
      subtitle="Ask questions, follow topics, save deals and connect with investors, operators and lenders. Free."
    >
      <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 20 }}>Create your account</h2>
      <AuthForm mode="signup" next={next} />
    </AuthShell>
  );
}
