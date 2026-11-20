"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signIn, signInWithGoogle, signUp, type AuthState } from "@/app/actions/auth";
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

/** The Google "G" in its four brand colors. */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/** "Continue with Google". Its own form, so it can sit above the email form. */
function GoogleButton({ next }: { next: string }) {
  const [pending, setPending] = useState(false);
  return (
    <form action={signInWithGoogle} onSubmit={() => setPending(true)}>
      <input type="hidden" name="next" value={next} />
      <Button variant="neutral" size="lg" type="submit" full loading={pending} iconStart={<GoogleMark />}>
        Continue with Google
      </Button>
    </form>
  );
}

/** The log in and sign up forms. Errors from the server show above the fields. */
export function AuthForm({ mode, next, linkError, googleError, email }: { mode: "login" | "signup"; next: string; linkError?: boolean; googleError?: boolean; email?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? signIn : signUp, {});
  const isSignup = mode === "signup";
  const nextQuery = next !== "/forums" ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className="auth-form">
      {linkError && (
        <Alert tone="danger" title="That link has expired or was already used">
          Log in, or ask for a new link.
        </Alert>
      )}
      {googleError && (
        <Alert tone="danger" title="We could not sign you in with Google">
          Try again, or use your email and password.
        </Alert>
      )}
      <GoogleButton next={next} />
      <div className="auth-or" role="separator">
        <span>or with email</span>
      </div>
      <form action={action} className="auth-form">
        <input type="hidden" name="next" value={next} />
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
        {isSignup && <TextField label="What best describes you?" name="headline" optional placeholder="Investor · Columbus, OH" maxLength={80} hint="Shown next to your name in the forums." />}

        <Button variant="primary" size="lg" type="submit" full loading={pending}>
          {isSignup ? "Create free account" : "Log in"}
        </Button>
        <p className="auth-switch">
          {isSignup ? "Already a member? " : "New to The Storage Network? "}
          <Link href={`${isSignup ? "/login" : "/signup"}${nextQuery}`}>{isSignup ? "Log in" : "Join free"}</Link>
        </p>
      </form>
    </div>
  );
}
