"use client";

import { toggleFollowPerson } from "@/app/actions/deals";
import { useToggle } from "@/lib/useToggle";

/** Follow button with the live follower count beside it. */
export function FollowPersonButton({ personId, following, followers }: { personId: string; following: boolean; followers: number }) {
  const t = useToggle(following, (on) => toggleFollowPerson(personId, on));
  const n = followers + t.delta;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <button className={`m-btn ${t.on ? "done" : "m-btn-o"}`} type="button" onClick={t.toggle} aria-pressed={t.on}>
        {t.on ? "Following" : "Follow"}
      </button>
      <span style={{ fontSize: 14, color: "#C5D1E3" }}>
        <b style={{ color: "#fff" }}>{n}</b> {n === 1 ? "follower" : "followers"}
      </span>
    </span>
  );
}
