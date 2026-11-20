import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { Verified } from "@/components/Verified";
import { LikeButton, SaveButton } from "@/components/forum/ThreadActions";
import { timeAgo } from "@/lib/format";
import { toPlainText } from "@/lib/richtext";
import type { Author, Category, Thread } from "@/lib/types";

export type ThreadCardData = Thread & {
  author: Author | null;
  category: Category | null;
  repliers: { name: string; color: string }[];
};

/** One discussion in a list: who posted and when, the title, one line of the post, then its topic, replies and actions. */
export function ThreadCard({ thread: t, liked, saved }: { thread: ThreadCardData; liked: boolean; saved: boolean }) {
  const author = t.author;
  const cat = t.category;
  return (
    <article className="f-post">
      <div className="f-who">
        <Avatar name={author?.full_name ?? "?"} color={author?.avatar_color ?? "#E6EBF3"} size={24} radius={12} fontSize={10} />
        {author ? (
          <Link className="f-name" href={`/u/${author.id}`}>
            {author.full_name}
          </Link>
        ) : (
          <span className="f-name">Former member</span>
        )}
        {author?.verified && <Verified />}
        <span>· {t.pinned ? "Pinned" : timeAgo(t.last_activity_at)}</span>
        {(t.pinned || t.solved) && (
          <span className="f-flags">
            {t.pinned && <span className="f-pill blue">Pinned</span>}
            {t.solved && (
              <span className="f-pill green">
                <Icon name="check" size={12} strokeWidth={3} />
                Answered
              </span>
            )}
          </span>
        )}
      </div>
      <Link className="f-title" href={`/forums/${t.id}`}>
        {t.title}
      </Link>
      <p className="f-ex">{toPlainText(t.body)}</p>
      <div className="f-foot">
        {cat && (
          <Link className="f-pill" href={`/forums?cat=${cat.id}`}>
            {cat.name}
          </Link>
        )}
        <Link className="f-replies" href={`/forums/${t.id}#replies`}>
          <Icon name="chat" size={14} />
          {t.reply_count === 0 ? "No replies yet" : `${t.reply_count} ${t.reply_count === 1 ? "reply" : "replies"}`}
        </Link>
        <span className="f-actions">
          <LikeButton threadId={t.id} likes={t.like_count} liked={liked} />
          <SaveButton threadId={t.id} saved={saved} />
        </span>
      </div>
    </article>
  );
}
