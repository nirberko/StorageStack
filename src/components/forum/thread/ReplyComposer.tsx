"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createReply } from "@/app/actions/forum";
import { Avatar } from "@/components/Avatar";

export function ReplyComposer({ threadId, name, color }: { threadId: number; name: string; color: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) {
      setError("Write a reply first.");
      return;
    }
    start(async () => {
      const res = await createReply(threadId, body);
      if (res.ok) {
        setBody("");
        setError(null);
        router.refresh();
      } else if (res.needsLogin) {
        router.push(`/login?next=/forums/${threadId}`);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <Avatar name={name} color={color} size={40} radius={13} fontSize={13} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <label htmlFor="reply-body" className="sr-only">
          Your reply
        </label>
        <textarea
          id="reply-body"
          className="x-input"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share what you know. Specific numbers and real experience help the most."
          style={{ minHeight: 120 }}
        />
        {error && (
          <div className="m-alert err" role="alert" style={{ marginTop: 8 }}>
            {error}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button className="m-btn m-btn-o" type="submit" disabled={pending}>
            {pending ? "Posting…" : "Post reply"}
          </button>
        </div>
      </div>
    </form>
  );
}
