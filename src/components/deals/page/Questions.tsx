"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { answerQuestion, askQuestion } from "@/app/actions/deal-page";
import { toggleQuestionLike } from "@/app/actions/deals";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { useToggle } from "@/lib/useToggle";

export function AskForm({ dealId, viewer }: { dealId: number; viewer: { name: string; color: string } | null }) {
  const path = usePathname();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!viewer) {
    return (
      <div style={{ marginTop: 18, background: "#F5F6FA", borderRadius: 16, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ flex: 1, minWidth: 200, fontSize: 14, color: "#4A576B" }}>Log in to ask a question about this deal.</span>
        <Link className="m-btn m-btn-n" href={`/login?next=${encodeURIComponent(path + "#qa")}`}>
          Log in to ask
        </Link>
      </div>
    );
  }

  return (
    <form
      style={{ marginTop: 18, display: "flex", gap: 12, alignItems: "flex-start" }}
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await askQuestion(dealId, text);
          if (res.ok) {
            setText("");
            setError(null);
          } else setError(res.error);
        });
      }}
    >
      <Avatar name={viewer.name} color={viewer.color} size={40} radius={13} fontSize={13} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <label htmlFor="xAsk" className="sr-only">
          Ask a question about this deal
        </label>
        <textarea
          id="xAsk"
          className="x-input"
          placeholder="Ask about the numbers, the plan or the market..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={4000}
        />
        {error && (
          <p role="alert" style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: "#A82A2A" }}>
            {error}
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button className="m-btn m-btn-n" type="submit" disabled={pending || text.trim().length < 3}>
            {pending ? "Posting…" : "Ask publicly"}
          </button>
        </div>
      </div>
    </form>
  );
}

export function AnswerForm({ questionId, dealId }: { questionId: number; dealId: number }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  if (!open) {
    return (
      <button className="x-like" type="button" onClick={() => setOpen(true)} style={{ color: "#B5440A" }}>
        <Icon name="reply" size={15} />
        Answer
      </button>
    );
  }
  return (
    <form
      style={{ marginTop: 10, width: "100%" }}
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await answerQuestion(questionId, dealId, text);
          if (res.ok) router.refresh();
          else setError(res.error);
        });
      }}
    >
      <label htmlFor={`ans-${questionId}`} className="sr-only">
        Your answer
      </label>
      <textarea id={`ans-${questionId}`} className="x-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Answer in public so every member sees it" autoFocus />
      {error && (
        <p role="alert" style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: "#A82A2A" }}>
          {error}
        </p>
      )}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
        <button className="m-btn m-btn-g" type="button" onClick={() => setOpen(false)}>
          Cancel
        </button>
        <button className="m-btn m-btn-n" type="submit" disabled={pending || !text.trim()}>
          {pending ? "Posting…" : "Post answer"}
        </button>
      </div>
    </form>
  );
}

export function QuestionLike({ questionId, likes, liked }: { questionId: number; likes: number; liked: boolean }) {
  const t = useToggle(liked, (on) => toggleQuestionLike(questionId, on));
  return (
    <button className={`x-like${t.on ? " on" : ""}`} type="button" onClick={t.toggle} aria-pressed={t.on}>
      <Icon name="thumb" size={15} />
      Helpful · {likes + t.delta}
    </button>
  );
}
