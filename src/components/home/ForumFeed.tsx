import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { compact, timeAgo } from "@/lib/format";
import type { FeedId, FeedItem } from "@/lib/queries/home";

const TABS: { id: FeedId; label: string }[] = [
  { id: "following", label: "Following" },
  { id: "latest", label: "Latest" },
  { id: "replies", label: "Replies to you" },
];

/** "Latest in the forums" on the home page. Tabs switch with ?feed=, like the forum sort tabs. */
export function ForumFeed({ feed, items, followsAnything }: { feed: FeedId; items: FeedItem[]; followsAnything: boolean }) {
  const empty =
    feed === "replies"
      ? ["No replies to your discussions yet.", "When someone answers, it shows up here."]
      : feed === "following" && !followsAnything
        ? ["You are not following anything yet.", "Follow topics in the forums, or members on their profiles, to see their discussions here."]
        : ["Nothing new here yet.", "Start a discussion and get the conversation going."];

  return (
    <section id="feed" className="m-card" style={{ padding: 24, scrollMarginTop: 90 }} aria-labelledby="feed-title">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h2 id="feed-title" className="x-h2">
          Latest in the forums
        </h2>
        <nav className="m-seg" aria-label="Show discussions">
          {TABS.map((t) => (
            <Link key={t.id} className={t.id === feed ? "on" : undefined} aria-current={t.id === feed ? "true" : undefined} href={`/?feed=${t.id}`} scroll={false}>
              {t.label}
            </Link>
          ))}
        </nav>
      </div>

      <div style={{ marginTop: 18 }}>
        {items.length === 0 && (
          <div className="m-empty" style={{ padding: "32px 12px" }}>
            <b>{empty[0]}</b>
            <span>{empty[1]}</span>
          </div>
        )}
        {items.map((it) => (
          <article key={it.key} className="h-feed">
            <Avatar name={it.person?.full_name ?? "?"} color={it.person?.avatar_color ?? "#E6EBF3"} size={42} radius={14} fontSize={14} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontSize: 14, color: "#5E6B7E" }}>
                {it.person ? (
                  <Link href={`/u/${it.person.id}`} style={{ fontWeight: 800, color: "#0F1B2D" }}>
                    {it.person.full_name}
                  </Link>
                ) : (
                  <b style={{ color: "#0F1B2D" }}>Former member</b>
                )}
                <span>{it.verb}</span>
                {it.category && (
                  <Link href={`/forums?cat=${it.category.id}`} className="m-badge" style={{ fontWeight: 700, color: it.category.ink, background: it.category.tint }}>
                    {it.category.name}
                  </Link>
                )}
                <span style={{ marginLeft: "auto", fontSize: 13, whiteSpace: "nowrap" }}>{timeAgo(it.at)}</span>
              </div>
              <Link className="m-title" href={`/forums/${it.threadId}`} style={{ display: "block", marginTop: 6, fontSize: 16 }}>
                {it.title}
              </Link>
              {it.preview && (
                <p className="m-ex" style={{ fontSize: 14 }}>
                  {it.preview}
                </p>
              )}
              <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 13, fontWeight: 600, color: "#5E6B7E" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <Icon name="chat" size={14} />
                  {it.replies} {it.replies === 1 ? "reply" : "replies"}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <Icon name="eye" size={15} />
                  {compact(it.views)} views
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div style={{ borderTop: "1px solid #EEF1F5", marginTop: 6, paddingTop: 14, textAlign: "center" }}>
        <Link className="h-link" href="/forums" style={{ gap: 4 }}>
          See all discussions
          <Icon name="chevron" size={16} />
        </Link>
      </div>
    </section>
  );
}
