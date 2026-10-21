import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { Icon } from "@/components/Icon";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · The Storage Network" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const supabase = await createClient();
  const [members, topics] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div className="wrap" style={{ paddingTop: 22, paddingBottom: 64 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <span className="m-ic" style={{ width: 48, height: 48, borderRadius: 15, background: "var(--navy)" }}>
          <Icon name="shieldCheck" size={22} stroke="#FFFFFF" />
        </span>
        <div>
          <h1 style={{ fontSize: 30, lineHeight: 1.1, fontWeight: 800, letterSpacing: "-0.03em" }}>Admin</h1>
          <p style={{ marginTop: 4, fontSize: 15, color: "#5E6B7E" }}>Manage members and forum topics. Only admins can see this.</p>
        </div>
      </div>
      <div className="page-cols" style={{ paddingBottom: 0 }}>
        <aside className="col-side" style={{ flexBasis: 220 }}>
          <AdminNav counts={{ "/admin/members": members.count ?? 0, "/admin/topics": topics.count ?? 0 }} />
        </aside>
        <main className="col-main" style={{ gap: 16 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
