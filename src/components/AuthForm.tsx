"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "@/app/actions/auth";
import { Button } from "@/components/ui/atoms/Button/Button";
import { Alert } from "@/components/ui/molecules/Alert/Alert";
import { TextField, type TextFieldProps } from "@/components/ui/molecules/TextField/TextField";

/** A password field with a Show / Hide button inside the box. */
export function PasswordField(props: Omit<TextFieldProps, "type" | "suffix">) {
  const [shown, setShown] = useState(false);
  return (
    <TextField
      {...props}
      type={shown ? "text" : "password"}
      suffix={
        <button type="button" className="auth-show" onClick={() => setShown((s) => !s)} aria-pressed={shown} aria-label={shown ? "Hide password" : "Show password"}>
          {shown ? "Hide" : "Show"}
        </button>
      }
    />
  );
}

/** The log in and sign up forms. Errors from the server show above the fields. */
export function AuthForm({ mode, next, linkError, email }: { mode: "login" | "signup"; next: string; linkError?: boolean; email?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? signIn : signUp, {});
  const isSignup = mode === "signup";
  const nextQuery = next !== "/forums" ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <form action={action} className="auth-form">
      <input type="hidden" name="next" value={next} />
      {linkError && (
        <Alert tone="danger" title="That link has expired or was already used">
          Log in, or ask for a new link.
        </Alert>
      )}
      {state.error && <Alert tone="danger" title={state.error} />}
      {state.message && <Alert tone="success" title={state.message} />}

      {isSignup && <TextField label="Your name" name="full_name" autoComplete="name" required />}
      <TextField label="Email" name="email" type="email" autoComplete="email" defaultValue={email} required />
      {isSignup ? (
        <PasswordField label="Password" name="password" autoComplete="new-password" minLength={8} hint="At least 8 characters." required />
      ) : (
        <div className="auth-pass">
          <PasswordField label="Password" name="password" autoComplete="current-password" required />
          <Link className="auth-forgot" href="/forgot-password">
            Forgot password?
          </Link>
        </div>
      )}
      {isSignup && (
        <TextField label="What best describes you?" name="headline" optional placeholder="Investor · Columbus, OH" maxLength={80} hint="Shown next to your name in the forums." />
      )}

      <Button variant="primary" size="lg" type="submit" full loading={pending}>
        {isSignup ? "Create free account" : "Log in"}
      </Button>
      <p className="auth-switch">
        {isSignup ? "Already a member? " : "New to The Storage Network? "}
        <Link href={`${isSignup ? "/login" : "/signup"}${nextQuery}`}>{isSignup ? "Log in" : "Join free"}</Link>
      </p>
    </form>
  );
}
