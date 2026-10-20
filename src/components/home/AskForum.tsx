import Link from "next/link";
import { Icon } from "@/components/Icon";
import type { AskItem } from "@/lib/queries/home";

/** A quick question box (prefills the new-discussion title) and recent questions that need answers. */
export function AskForum({ items }: { items: AskItem[] }) {
  return (
    <section className="m-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }} aria-labelledby="ask-title">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span className="h-tile" style={{ background: "#E6EBF3" }}>
          <Icon name="chat" size={22} stroke="#0B1F3A" />
        </span>
        <h2 id="ask-title" style={{ flex: 1, fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em" }}>
          Ask the forum
        </h2>
        <Link className="h-link" href="/forums">
          Open forums ›
        </Link>
      </div>

      <form action="/forums/new" style={{ display: "flex", gap: 8 }}>
        <label htmlFor="ask-q" className="sr-only">
          Your question
        </label>
        <input id="ask-q" name="title" className="d-input" placeholder="Ask about financing, rents or your market" maxLength={200} required style={{ flex: 1, minWidth: 0 }} />
        <button type="submit" className="m-btn m-btn-n" style={{ minHeight: 48 }}>
          Ask
        </button>
      </form>

      <div>
        <span className="h-eyebrow" style={{ marginBottom: 4 }}>
          Members are asking
        </span>
        {items.length === 0 && <p className="x-sub">Every recent question has answers. Check back soon.</p>}
        {items.map((t) => (
          <Link key={t.id} className="m-trend" href={`/forums/${t.id}`} style={{ alignItems: "center", color: "#0F1B2D" }}>
            <span className="m-ic" style={{ width: 40, height: 40, borderRadius: 12, background: t.category?.tint ?? "#EEF2F8" }}>
              <Icon d={t.category?.icon} name={t.category ? undefined : "chat"} size={18} stroke={t.category?.ink ?? "#0B1F3A"} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="m-tt" style={{ display: "block", fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>
                {t.title}
              </span>
              <span style={{ display: "block", fontSize: 13, color: "#5E6B7E", marginTop: 2 }}>
                {t.category ? `${t.category.name} · ` : ""}
                {t.replies === 0 ? "No replies yet" : `${t.replies} ${t.replies === 1 ? "reply" : "replies"}`}
              </span>
            </span>
            <Icon name="chevron" size={18} stroke="#5E6B7E" style={{ flex: "none" }} />
          </Link>
        ))}
      </div>
    </section>
  );
}
