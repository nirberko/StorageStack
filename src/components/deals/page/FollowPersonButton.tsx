"use client";

import { toggleFollowPerson } from "@/app/actions/deals";
import { useToggle } from "@/lib/useToggle";

export function FollowPersonButton({ personId, following }: { personId: string; following: boolean }) {
  const t = useToggle(following, (on) => toggleFollowPerson(personId, on));
  return (
    <button className={`m-btn ${t.on ? "done" : "m-btn-s"}`} type="button" onClick={t.toggle} aria-pressed={t.on} style={{ flex: 1 }}>
      {t.on ? "Following" : "Follow"}
    </button>
  );
}
