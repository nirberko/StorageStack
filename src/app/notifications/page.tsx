import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { markAllNotificationsRead } from "@/app/actions/notifications";
import { Icon } from "@/components/Icon";
import { NotificationList } from "@/components/notifications/NotificationList";
import { getViewer } from "@/lib/auth";
import { listNotifications } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Notifications" };

const LIMIT = 100;

export default async function NotificationsPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/notifications");

  const items = await listNotifications(await createClient(), viewer.id, LIMIT);
  const unread = items.filter((n) => !n.read_at).length;

  return (
    <div className="wrap" style={{ paddingTop: 22, paddingBottom: 64, maxWidth: 760 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 36, lineHeight: 1.1, fontWeight: 800, letterSpacing: "-0.03em" }}>Notifications</h1>
          <p style={{ marginTop: 8, fontSize: 16, color: "#5E6B7E" }}>
            {unread ? `${unread} unread` : "You’re all caught up."}
          </p>
        </div>
        {unread > 0 && (
          <form action={markAllNotificationsRead}>
            <button className="m-btn m-btn-line" type="submit">
              <Icon name="check" />
              Mark all as read
            </button>
          </form>
        )}
      </div>

      <section className="x-sec" style={{ marginTop: 20, padding: 8 }}>
        {items.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#5E6B7E", lineHeight: 1.5 }}>
            <Icon name="bell" size={28} style={{ color: "#8A94A6" }} />
            <p style={{ marginTop: 10, fontSize: 15 }}>
              Nothing yet. When someone replies to your discussions, replies after you, likes your posts, marks your
              reply as the answer or follows you, you’ll see it here.
            </p>
          </div>
        ) : (
          <NotificationList items={items} />
        )}
      </section>
    </div>
  );
}
