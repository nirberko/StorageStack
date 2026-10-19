"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileFormState } from "@/app/actions/profile";
import type { Profile } from "@/lib/types";

export function ProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(updateProfile, {});
  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {state.error && (
        <div className="m-alert err" role="alert">
          {state.error}
        </div>
      )}
      {state.saved && (
        <div className="m-alert ok" role="status">
          Your profile is saved.
        </div>
      )}
      <div>
        <label className="d-label" htmlFor="full_name">
          Name
        </label>
        <input id="full_name" name="full_name" className="d-input" defaultValue={profile.full_name} required maxLength={80} autoComplete="name" />
      </div>
      <div>
        <label className="d-label" htmlFor="headline">
          Headline
        </label>
        <input id="headline" name="headline" className="d-input" defaultValue={profile.headline} maxLength={80} placeholder="e.g. Operator · 3 facilities" />
        <span className="d-help">Shown next to your name on every post.</span>
      </div>
      <div>
        <label className="d-label" htmlFor="location">
          Location
        </label>
        <input id="location" name="location" className="d-input" defaultValue={profile.location} maxLength={80} placeholder="e.g. Columbus, OH" />
      </div>
      <div>
        <label className="d-label" htmlFor="bio">
          About you
        </label>
        <textarea
          id="bio"
          name="bio"
          className="d-input"
          defaultValue={profile.bio}
          maxLength={600}
          placeholder="What you own or operate, what you are looking for and what you can help others with."
        />
      </div>
      <div>
        <label className="d-label" htmlFor="email">
          Email
        </label>
        <input id="email" className="d-input" value={email} readOnly disabled style={{ background: "#F5F6FA", color: "#5E6B7E" }} />
        <span className="d-help">Only you can see this.</span>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="m-btn m-btn-o" type="submit" disabled={pending} style={{ minWidth: 160 }}>
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
