import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { AuthShell } from "@/components/AuthShell";

export const metadata: Metadata = { title: "Join free" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string; email?: string }> }) {
  const { next = "/forums", email } = await searchParams;
  return (
    <AuthShell title="Join The Storage Network" subtitle="Free. Ask questions and learn from owners, operators and lenders.">
      <AuthForm mode="signup" next={next} email={email} />
    </AuthShell>
  );
}
