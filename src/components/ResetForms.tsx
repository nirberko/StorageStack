"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, updatePassword, type AuthState } from "@/app/actions/auth";
import { PasswordField } from "@/components/AuthForm";
import { Button } from "@/components/ui/atoms/Button/Button";
import { Alert } from "@/components/ui/molecules/Alert/Alert";
import { TextField } from "@/components/ui/molecules/TextField/TextField";

/** Asks for the email to send the reset link to. */
export function ResetRequestForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestPasswordReset, {});
  return (
    <form action={action} className="auth-form">
      {state.error && <Alert tone="danger" title={state.error} />}
      {state.message && <Alert tone="success" title={state.message} />}
      <TextField label="Email" name="email" type="email" autoComplete="email" required />
      <Button variant="primary" size="lg" type="submit" full loading={pending}>
        Send reset link
      </Button>
      <p className="auth-switch">
        Remembered it? <Link href="/login">Log in</Link>
      </p>
    </form>
  );
}

/** Sets the new password once the reset link has signed the member in. */
export function NewPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, {});
  return (
    <form action={action} className="auth-form">
      {state.error && (
        <Alert tone="danger" title={state.error}>
          <Link href="/forgot-password">Send a new link</Link>
        </Alert>
      )}
      <PasswordField label="New password" name="password" autoComplete="new-password" minLength={8} hint="At least 8 characters." required />
      <Button variant="primary" size="lg" type="submit" full loading={pending}>
        Save password
      </Button>
    </form>
  );
}
