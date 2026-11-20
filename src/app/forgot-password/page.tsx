import type { Metadata } from "next";
import { AuthShell } from "@/components/AuthShell";
import { ResetRequestForm } from "@/components/ResetForms";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset your password" subtitle="Enter your email and we will send you a link to choose a new one.">
      <ResetRequestForm />
    </AuthShell>
  );
}
