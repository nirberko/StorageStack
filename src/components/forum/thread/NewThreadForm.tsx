"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createThread, type ThreadFormState } from "@/app/actions/forum";
import { Icon } from "@/components/Icon";
import { RichEditor } from "@/components/forum/thread/RichEditor";
import { TagInput } from "@/components/forum/thread/TagInput";
import type { Category } from "@/lib/types";

const GROUPS = ["Start here", "Buy & build", "Operate", "Money & legal"];

export function NewThreadForm({ categories, initialCat }: { categories: Category[]; initialCat?: string }) {
  const [state, action, pending] = useActionState<ThreadFormState, FormData>(createThread, {});
  const f = state.fields ?? {};
  const [cat, setCat] = useState(f.category_id || initialCat || "");

  return (
    <form action={action}>
      <input type="hidden" name="category_id" value={cat} />
      {state.error && (
        <div className="m-alert err" role="alert" style={{ marginBottom: 20 }}>
          {state.error}
        </div>
      )}

      <div className="p-sec" style={{ borderTop: 0, paddingTop: 0 }}>
        <span className="d-label" id="topic-label">
          Pick a topic
        </span>
        <div role="radiogroup" aria-labelledby="topic-label" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {GROUPS.map((g) => (
            <div key={g}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.09em", textTransform: "uppercase", color: "#5E6B7E", marginBottom: 8 }}>{g}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {categories
                  .filter((c) => c.group_name === g)
                  .map((c) => {
                    const on = c.id === cat;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        className={`d-chip${on ? " on" : ""}`}
                        onClick={() => setCat(c.id)}
                        title={c.description}
                      >
                        <Icon d={c.icon} size={17} stroke={on ? "currentColor" : c.color} />
                        {c.name}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-sec" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label className="d-label" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            name="title"
            className="d-input"
            defaultValue={f.title}
            maxLength={200}
            minLength={8}
            required
            placeholder="e.g. SBA loan or a regular bank loan for a $3.1M purchase?"
            style={{ fontWeight: 700 }}
          />
          <span className="d-help">Ask a clear question or say what you are sharing. Specific titles get better answers.</span>
        </div>
        <div>
          <span className="d-label" id="body-label">
            Details
          </span>
          <RichEditor
            name="body"
            labelId="body-label"
            initialHtml={f.body}
            placeholder="Give people the context they need: the market, the numbers, what you have tried and what you are unsure about."
          />
        </div>
        <div>
          <label className="d-label" htmlFor="tags">
            Tags <span style={{ fontWeight: 600, color: "#5E6B7E" }}>(optional)</span>
          </label>
          <TagInput
            name="tags"
            id="tags"
            initial={(f.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean)}
          />
          <span className="d-help" id="tags-help">
            Press Enter or a comma after each tag. Up to 4.
          </span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 20, borderTop: "1px solid #EEF1F5" }}>
        <Link className="m-btn m-btn-g" href="/forums">
          Cancel
        </Link>
        <button className="m-btn m-btn-o" type="submit" disabled={pending} style={{ minWidth: 180 }}>
          {pending ? "Posting…" : "Post discussion"}
        </button>
      </div>
    </form>
  );
}
