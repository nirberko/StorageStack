"use client";

import { useState, useTransition } from "react";
import { deleteThread } from "@/app/actions/forum";
import { Icon } from "@/components/Icon";

export function ShareButton() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="m-icon-btn"
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href.split("#")[0]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Clipboard can be blocked; nothing else to do.
        }
      }}
    >
      <Icon name="share" />
      {copied ? "Link copied" : "Share"}
    </button>
  );
}

export function DeleteThreadButton({ threadId }: { threadId: number }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <button
        className="m-icon-btn"
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Delete this discussion and all its replies? This cannot be undone.")) return;
          start(async () => {
            const res = await deleteThread(threadId);
            if (res && !res.ok) setError(res.error);
          });
        }}
      >
        <Icon name="trash" />
        {pending ? "Deleting…" : "Delete"}
      </button>
      {error && (
        <span role="alert" style={{ fontSize: 13, fontWeight: 700, color: "#A82A2A" }}>
          {error}
        </span>
      )}
    </>
  );
}
