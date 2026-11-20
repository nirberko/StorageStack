import Link from "next/link";
import { Icon } from "@/components/Icon";
import type { AskItem } from "@/lib/queries/home";

/** A quick question box (prefills the new-discussion title) and recent questions that need answers. */
export function AskForum({ items }: { items: AskItem[] }) {
  return (
    <section className="hm-card hm-ask" aria-labelledby="ask-title">
      <div className="hm-head">
        <span className="hm-ico">
          <Icon name="chat" size={18} />
        </span>
        <h2 id="ask-title">Ask the community</h2>
        <Link className="hm-more" href="/forums">
          Open forums
        </Link>
      </div>

      <form action="/forums/new" className="hm-ask-form">
        <label htmlFor="ask-q" className="sr-only">
          Your question
        </label>
        <input id="ask-q" name="title" className="d-input" placeholder="Ask about financing, rents or your market" maxLength={200} required />
        <button type="submit" className="m-btn m-btn-o">
          Ask
        </button>
      </form>

      <div>
        {items.length === 0 && <p className="hm-meta">Every recent question has answers. Check back soon.</p>}
        {items.slice(0, 4).map((t) => (
          <Link key={t.id} className="hm-q" href={`/forums/${t.id}`}>
            <span className="hm-qi" style={{ background: t.category?.tint ?? "var(--ds-fill)" }}>
              <Icon d={t.category?.icon} name={t.category ? undefined : "chat"} size={16} stroke={t.category?.ink ?? "var(--ink)"} />
            </span>
            <span style={{ minWidth: 0 }}>
              <b>{t.title}</b>
              <small>
                {t.category ? `${t.category.name} · ` : ""}
                {t.replies === 0 ? "No replies yet" : `${t.replies} ${t.replies === 1 ? "reply" : "replies"}`}
              </small>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
