"use client";

import { toggleThreadLike, toggleThreadSave } from "@/app/actions/forum";
import { Icon } from "@/components/Icon";
import { useToggle } from "@/lib/useToggle";

export function LikeButton({ threadId, likes, liked }: { threadId: number; likes: number; liked: boolean }) {
  const t = useToggle(liked, (on) => toggleThreadLike(threadId, on));
  return (
    <button
      className={`m-icon-btn${t.on ? " on" : ""}`}
      type="button"
      onClick={t.toggle}
      aria-pressed={t.on}
      aria-label={`Helpful, ${likes + t.delta} votes`}
    >
      <Icon name="thumb" />
      {likes + t.delta}
    </button>
  );
}

export function SaveButton({ threadId, saved }: { threadId: number; saved: boolean }) {
  const t = useToggle(saved, (on) => toggleThreadSave(threadId, on));
  return (
    <button
      className={`m-icon-btn${t.on ? " on" : ""}`}
      type="button"
      onClick={t.toggle}
      aria-pressed={t.on}
      aria-label={t.on ? "Remove from saved" : "Save discussion"}
    >
      <Icon name="bookmark" fill={t.on ? "currentColor" : "none"} />
    </button>
  );
}
