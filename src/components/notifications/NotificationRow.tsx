import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { timeAgo } from "@/lib/format";
import type { IconName } from "@/lib/icons";
import { describeNotification, type NotificationItem } from "@/lib/notifications";

const KIND_ICON: Record<string, IconName> = {
  reply: "reply",
  thread_reply: "chat",
  like: "heart",
  answer: "check",
  follow: "user",
};

/** One notification: who, what, when. Unread ones are tinted and carry a dot. */
export function NotificationRow({ n, onOpen }: { n: NotificationItem; onOpen?: (n: NotificationItem) => void }) {
  const { text, href } = describeNotification(n);
  const name = n.actor?.full_name ?? "A former member";
  const unread = !n.read_at;

  return (
    <Link href={href} className={`m-notif${unread ? " unread" : ""}`} onClick={() => onOpen?.(n)}>
      <span className="m-notif-face">
        <Avatar name={name} color={n.actor?.avatar_color ?? "#E6EBF3"} photo={n.actor?.avatar_path} size={38} radius={12} fontSize={12} />
        <span className={`m-notif-kind k-${n.kind}`}>
          <Icon name={KIND_ICON[n.kind] ?? "bell"} size={11} strokeWidth={2.6} />
        </span>
      </span>
      <span className="m-notif-body">
        <span className="m-notif-text">
          <b>{name}</b> {text}
        </span>
        <span className="m-notif-time">{timeAgo(n.created_at)}</span>
      </span>
      {unread && <span className="m-notif-dot" aria-label="Unread" />}
    </Link>
  );
}
