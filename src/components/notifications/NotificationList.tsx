"use client";

import { markNotificationsRead } from "@/app/actions/notifications";
import { NotificationRow } from "@/components/notifications/NotificationRow";
import type { NotificationItem } from "@/lib/notifications";

/** The full notification list; opening an unread one marks it read. */
export function NotificationList({ items }: { items: NotificationItem[] }) {
  return items.map((n) => (
    <NotificationRow key={n.id} n={n} onOpen={(x) => !x.read_at && markNotificationsRead([x.id])} />
  ));
}
