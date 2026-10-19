"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteReply, markAnswer } from "@/app/actions/forum";
import { Icon } from "@/components/Icon";

export function ReplyActions({
  replyId, threadId, isAnswer, canMark, canDelete,
}: { replyId: number; threadId: number; isAnswer: boolean; canMark: boolean; canDelete: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    start(async () => {
      const res = await fn();
      if (res.ok) {
        setError(null);
        router.refresh();
      } else setError(res.error ?? "Something went wrong.");
    });
  }

  if (!canMark && !canDelete) return null;
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
      {canMark && (
        <button
          className={`x-like${isAnswer ? " on" : ""}`}
          type="button"
          disabled={pending}
          onClick={() => run(() => markAnswer(replyId, threadId, !isAnswer))}
          style={isAnswer ? { background: "#DDF3E8", color: "#17603F" } : undefined}
        >
          <Icon name="check" size={15} strokeWidth={2.6} />
          {isAnswer ? "Unmark answer" : "Mark as answer"}
        </button>
      )}
      {canDelete && (
        <button
          className="x-like"
          type="button"
          disabled={pending}
          onClick={() => {
            if (confirm("Delete this reply? This cannot be undone.")) run(() => deleteReply(replyId, threadId));
          }}
        >
          <Icon name="trash" size={15} />
          Delete
        </button>
      )}
      {error && (
        <span role="alert" style={{ fontSize: 13, fontWeight: 700, color: "#A82A2A" }}>
          {error}
        </span>
      )}
    </span>
  );
}
