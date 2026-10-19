"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createThread, type ThreadFormState } from "@/app/actions/forum";
import { Icon } from "@/components/Icon";
import type { Category } from "@/lib/types";

const GROUPS = ["Start here", "Buy & build", "Operate", "Money & legal"];

export function NewThreadForm({ categories, initialCat }: { categories: Category[]; initialCat?: string }) {
  const [state, action, pending] = useActionState<ThreadFormState, FormData>(createThread, {});
  const f = state.fields ?? {};
  const [cat, setCat] = useState(f.category_id || initialCat || "");
  const [showNumbers, setShowNumbers] = useState(false);

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
          <label className="d-label" htmlFor="body">
            Details
          </label>
          <textarea
            id="body"
            name="body"
            className="d-input"
            defaultValue={f.body}
            required
            maxLength={20000}
            placeholder="Give people the context they need: the market, the numbers, what you have tried and what you are unsure about."
            style={{ minHeight: 220 }}
          />
        </div>
        <div>
          <label className="d-label" htmlFor="tags">
            Tags <span style={{ fontWeight: 600, color: "#5E6B7E" }}>(optional)</span>
          </label>
          <input id="tags" name="tags" className="d-input" defaultValue={f.tags} placeholder="e.g. Deal review, Ohio" />
          <span className="d-help">Separate with commas. Up to 4.</span>
        </div>
      </div>

      <div className="p-sec">
        {!showNumbers ? (
          <button type="button" className="m-btn m-btn-s" onClick={() => setShowNumbers(true)}>
            <Icon name="plus" size={16} strokeWidth={2.4} />
            Add key numbers
          </button>
        ) : (
          <>
            <span className="d-label">Key numbers</span>
            <span className="d-help" style={{ margin: "-4px 0 12px" }}>
              Shown as chips on your post, like &ldquo;Asking $2.4M&rdquo; or &ldquo;Occupancy 84%&rdquo;.
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ display: "flex", gap: 8 }}>
                  <label className="sr-only" htmlFor={`stat_l_${i}`}>
                    Label {i + 1}
                  </label>
                  <input id={`stat_l_${i}`} name={`stat_l_${i}`} className="d-input" placeholder="Label" maxLength={24} style={{ flex: "1 1 50%" }} />
                  <label className="sr-only" htmlFor={`stat_v_${i}`}>
                    Value {i + 1}
                  </label>
                  <input id={`stat_v_${i}`} name={`stat_v_${i}`} className="d-input" placeholder="Value" maxLength={16} style={{ flex: "1 1 50%", fontWeight: 700 }} />
                </div>
              ))}
            </div>
          </>
        )}
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
