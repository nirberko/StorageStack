"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { NotificationRow } from "@/components/notifications/NotificationRow";
import { getRecentNotifications, markNotificationsRead } from "@/app/actions/notifications";
import type { NotificationItem } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/client";

/**
 * The bell in the header: an unread count, and the latest notifications in a dropdown.
 * Refreshes after each navigation, when the tab regains focus, and live via Supabase Realtime.
 */
export function NotificationBell({ userId, initialUnread }: { userId: string; initialUnread: number }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();

  const refresh = useCallback(async () => {
    const res = await getRecentNotifications().catch(() => null);
    if (!res) return;
    setItems(res.items);
    setUnread(res.unread);
  }, []);

  // After navigating (the header itself is not re-rendered) and when coming back to the tab.
  useEffect(() => {
    refresh();
    setOpen(false);
  }, [path, refresh]);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") refresh();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  // Live updates. If Realtime is unavailable this quietly does nothing.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, () => {
        refresh();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent | TouchEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function openOne(n: NotificationItem) {
    setOpen(false);
    if (n.read_at) return;
    const now = new Date().toISOString();
    setItems((list) => list?.map((x) => (x.id === n.id ? { ...x, read_at: now } : x)) ?? null);
    setUnread((u) => Math.max(0, u - 1));
    markNotificationsRead([n.id]);
  }

  async function markAll() {
    const now = new Date().toISOString();
    setItems((list) => list?.map((x) => (x.read_at ? x : { ...x, read_at: now })) ?? null);
    setUnread(0);
    await markNotificationsRead();
  }

  const label = unread ? `Notifications, ${unread} unread` : "Notifications";

  return (
    <div ref={ref} className="m-bell-wrap">
      <button
        type="button"
        className="m-bell"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) refresh();
        }}
      >
        <Icon name="bell" size={20} strokeWidth={2} />
        {unread > 0 && <span className="m-bell-count">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="m-card m-notif-pop" role="dialog" aria-label="Notifications">
          <div className="m-notif-head">
            <b>Notifications</b>
            {unread > 0 && (
              <button type="button" className="m-notif-link" onClick={markAll}>
                Mark all as read
              </button>
            )}
          </div>
          <div className="m-notif-list">
            {items === null ? (
              <p className="m-notif-empty">Loading…</p>
            ) : items.length === 0 ? (
              <p className="m-notif-empty">
                Nothing yet. When someone replies to your discussions, likes them or follows you, you’ll see it here.
              </p>
            ) : (
              items.map((n) => <NotificationRow key={n.id} n={n} onOpen={openOne} />)
            )}
          </div>
          <Link href="/notifications" className="m-notif-all" onClick={() => setOpen(false)}>
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
