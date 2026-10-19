"use client";

import { toggleCategoryFollow, toggleEventReminder } from "@/app/actions/forum";
import { Avatar } from "@/components/Avatar";
import { useToggle } from "@/lib/useToggle";

export function FollowCategoryButton({ categoryId, following, label }: { categoryId: string; following: boolean; label: string }) {
  const t = useToggle(following, (on) => toggleCategoryFollow(categoryId, on));
  return (
    <button className={`m-btn ${t.on ? "done" : "m-btn-s"}`} type="button" onClick={t.toggle} aria-pressed={t.on}>
      {t.on ? "Following" : label}
    </button>
  );
}

export function EventHost({
  eventId, reminded, going, hostName, hostColor,
}: { eventId: number; reminded: boolean; going: number; hostName: string; hostColor: string }) {
  const t = useToggle(reminded, (on) => toggleEventReminder(eventId, on));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
      <Avatar name={hostName} color={hostColor} size={36} radius={12} fontSize={12} />
      <span style={{ flex: 1, fontSize: 13, lineHeight: 1.35 }}>
        <b style={{ display: "block", fontSize: 14 }}>{hostName}</b>
        <span style={{ color: "#5E6B7E" }}>Host · {going + t.delta} going</span>
      </span>
      <button
        className="m-btn"
        type="button"
        onClick={t.toggle}
        aria-pressed={t.on}
        style={{ minHeight: 40, padding: "0 14px", fontSize: 13, background: t.on ? "#DDF3E8" : "#FFF0E6", color: t.on ? "#17603F" : "#B5440A" }}
      >
        {t.on ? "Reminder set" : "Remind me"}
      </button>
    </div>
  );
}
