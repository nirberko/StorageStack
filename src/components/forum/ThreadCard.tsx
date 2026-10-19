import Link from "next/link";
import { Avatar, Faces } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { Verified } from "@/components/Verified";
import { LikeButton, SaveButton } from "@/components/forum/ThreadActions";
import { compact, timeAgo } from "@/lib/format";
import { toPlainText } from "@/lib/richtext";
import type { Author, Category, Metric, Thread } from "@/lib/types";

export type ThreadCardData = Thread & {
  author: Author | null;
  category: Category | null;
  repliers: { name: string; color: string }[];
};

export function ThreadCard({ thread: t, liked, saved }: { thread: ThreadCardData; liked: boolean; saved: boolean }) {
  const stats = (t.stats as Metric[] | null) ?? [];
  const author = t.author;
  const cat = t.category;
  return (
    <article className={`m-post${t.pinned ? " pin" : ""}`}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Avatar name={author?.full_name ?? "?"} color={author?.avatar_color ?? "#E6EBF3"} size={42} radius={14} fontSize={14} />
        <span style={{ flex: 1, minWidth: 180, lineHeight: 1.35 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 15 }}>
            {author ? <Link href={`/u/${author.id}`}>{author.full_name}</Link> : "Former member"}
            {author?.verified && <Verified />}
          </span>
          <span style={{ display: "block", fontSize: 13, color: "#5E6B7E" }}>
            {author?.headline ? `${author.headline} · ` : ""}
            {t.pinned ? "Pinned" : timeAgo(t.last_activity_at)}
          </span>
        </span>
        {t.pinned && (
          <span className="m-badge" style={{ color: "#B5440A", background: "#FFE7D7" }}>
            Pinned
          </span>
        )}
        {t.solved && (
          <span className="m-badge" style={{ color: "#17603F", background: "#DDF3E8" }}>
            <Icon name="check" size={13} strokeWidth={3} />
            Answered
          </span>
        )}
        {cat && (
          <Link
            href={`/forums?cat=${cat.id}`}
            className="m-badge"
            style={{ fontWeight: 700, color: cat.ink, background: cat.tint }}
          >
            <Icon d={cat.icon} size={13} strokeWidth={2.4} />
            {cat.name}
          </Link>
        )}
      </div>
      <div style={{ marginTop: 14 }}>
        <Link className="m-title" href={`/forums/${t.id}`}>
          {t.title}
        </Link>
      </div>
      <p className="m-ex">{toPlainText(t.body)}</p>
      {stats.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          {stats.map((s, i) => (
            <span key={i} className="m-metric">
              {s.l} <b style={{ color: s.c ?? "#0F1B2D" }}>{s.v}</b>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16, flexWrap: "wrap" }}>
        {t.repliers.length > 0 && <Faces people={t.repliers} />}
        <Link href={`/forums/${t.id}#replies`} style={{ fontSize: 13, fontWeight: 700, color: "#1E2B3F" }}>
          {t.reply_count === 0 ? "No replies yet — be the first" : `${t.reply_count} ${t.reply_count === 1 ? "reply" : "replies"}`}
        </Link>
        <span style={{ fontSize: 13, color: "#5E6B7E", marginLeft: 10, display: "inline-flex", alignItems: "center", gap: 5 }}>
          <Icon name="eye" size={15} />
          <span className="sr-only">Views:</span>
          {compact(t.views)}
        </span>
        {t.tags.length > 0 && (
          <span className="m-hide-sm" style={{ display: "flex", gap: 6, marginLeft: 10, flexWrap: "wrap" }}>
            {t.tags.map((tag) => (
              <span key={tag} className="m-tag">
                {tag}
              </span>
            ))}
          </span>
        )}
        <span style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
          <LikeButton threadId={t.id} likes={t.like_count} liked={liked} />
          <SaveButton threadId={t.id} saved={saved} />
        </span>
      </div>
    </article>
  );
}
