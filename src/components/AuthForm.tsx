"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp, type AuthState } from "@/app/actions/auth";

export function AuthForm({ mode, next, linkError, email }: { mode: "login" | "signup"; next: string; linkError?: boolean; email?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? signIn : signUp, {});
  const isSignup = mode === "signup";

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <input type="hidden" name="next" value={next} />
      {linkError && <div className="m-alert err">That link has expired or was already used. Log in or request a new one.</div>}
      {state.error && (
        <div className="m-alert err" role="alert">
          {state.error}
        </div>
      )}
      {state.message && (
        <div className="m-alert ok" role="status">
          {state.message}
        </div>
      )}
      {isSignup && (
        <div>
          <label className="d-label" htmlFor="full_name">
            Your name
          </label>
          <input id="full_name" name="full_name" className="d-input" autoComplete="name" required />
        </div>
      )}
      <div>
        <label className="d-label" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" className="d-input" autoComplete="email" defaultValue={email} required />
      </div>
      <div>
        <label className="d-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="d-input"
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={isSignup ? 8 : undefined}
          required
        />
        {isSignup && <span className="d-help">At least 8 characters.</span>}
      </div>
      {isSignup && (
        <div>
          <label className="d-label" htmlFor="headline">
            What best describes you? <span style={{ fontWeight: 600, color: "#5E6B7E" }}>(optional)</span>
          </label>
          <input id="headline" name="headline" className="d-input" placeholder="e.g. Investor · Columbus, OH" maxLength={80} />
          <span className="d-help">Shown next to your name in the forums and the Deal Room.</span>
        </div>
      )}
      <button className="m-btn m-btn-o" type="submit" disabled={pending} style={{ minHeight: 50, fontSize: 16 }}>
        {pending ? "One moment…" : isSignup ? "Create free account" : "Log in"}
      </button>
      <p style={{ fontSize: 14, color: "#5E6B7E", textAlign: "center" }}>
        {isSignup ? "Already a member? " : "New to The Storage Network? "}
        <Link
          href={`${isSignup ? "/login" : "/signup"}${next !== "/forums" ? `?next=${encodeURIComponent(next)}` : ""}`}
          style={{ fontWeight: 700, color: "#DB520B" }}
        >
          {isSignup ? "Log in" : "Join free"}
        </Link>
      </p>
    </form>
  );
}
