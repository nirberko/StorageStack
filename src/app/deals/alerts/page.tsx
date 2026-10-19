import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteAlert } from "@/app/actions/deal-page";
import { Icon } from "@/components/Icon";
import { AlertForm } from "@/components/deals/page/AlertForm";
import { SubmitButton } from "@/components/deals/page/SubmitButton";
import { getViewer } from "@/lib/auth";
import { DEAL_TYPES, PROPERTY_BY_ID } from "@/lib/config";
import { money } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Deal alerts" };

export default async function AlertsPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/deals/alerts");
  const supabase = await createClient();

  const { data: alerts } = await supabase.from("deal_alerts").select("*").eq("user_id", viewer.id).order("created_at", { ascending: false });

  // How many live deals match each alert right now.
  const matches = await Promise.all(
    (alerts ?? []).map(async (a) => {
      let q = supabase.from("deals").select("id", { count: "exact", head: true }).eq("status", "live").neq("poster_id", viewer.id);
      if (a.deal_type) q = q.eq("type", a.deal_type);
      if (a.property_type) q = q.eq("property_type", a.property_type);
      if (a.region) q = q.eq("region", a.region);
      if (a.max_amount) q = q.lte("amount", a.max_amount);
      const { count } = await q;
      return count ?? 0;
    }),
  );

  return (
    <div className="wrap" style={{ paddingTop: 22, paddingBottom: 64 }}>
      <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#5E6B7E" }}>
        <Link href="/deals" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#5E6B7E" }}>
          <Icon name="back" size={16} strokeWidth={2.2} />
          Deal Room
        </Link>
        <span aria-hidden="true">/</span>
        <span style={{ color: "#0F1B2D" }}>Deal alerts</span>
      </nav>
      <h1 style={{ marginTop: 12, fontSize: 36, lineHeight: 1.1, fontWeight: 800, letterSpacing: "-0.03em" }}>Deal alerts</h1>
      <p style={{ marginTop: 8, fontSize: 16, color: "#5E6B7E", maxWidth: 640 }}>
        Tell us what you are looking for. Each alert shows how many live deals match it right now.
      </p>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start", marginTop: 24 }}>
        <main style={{ flex: "999 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {(alerts ?? []).length === 0 && (
            <div className="m-card m-empty">
              <b>No alerts yet</b>
              <span>Create your first one with the form.</span>
            </div>
          )}
          {(alerts ?? []).map((a, i) => {
            const qs = new URLSearchParams();
            if (a.deal_type) qs.set("tab", a.deal_type);
            if (a.property_type) qs.set("prop", a.property_type);
            if (a.region) qs.set("region", a.region);
            return (
              <div key={a.id} className="m-card" style={{ padding: "18px 20px", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                <span className="m-ic" style={{ width: 44, height: 44, borderRadius: 14, background: "#FFEDE2" }}>
                  <Icon name="bell" size={20} stroke="#DB520B" />
                </span>
                <span style={{ flex: "1 1 240px", minWidth: 0, lineHeight: 1.4 }}>
                  <b style={{ display: "block", fontSize: 16 }}>{a.label}</b>
                  <span style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                    <span className="m-tag">{a.deal_type ? DEAL_TYPES[a.deal_type].name : "Any deal type"}</span>
                    <span className="m-tag">{a.property_type ? PROPERTY_BY_ID[a.property_type].name : "Any property"}</span>
                    <span className="m-tag">{a.region ?? "Anywhere"}</span>
                    {a.max_amount ? <span className="m-tag">Up to {money(a.max_amount)}</span> : null}
                  </span>
                </span>
                <Link className="m-btn m-btn-s" href={`/deals${qs.toString() ? `?${qs}` : ""}`} style={{ minHeight: 40, fontSize: 14 }}>
                  {matches[i]} {matches[i] === 1 ? "match" : "matches"}
                </Link>
                <form action={deleteAlert.bind(null, a.id)}>
                  <SubmitButton className="m-btn m-btn-g" style={{ minHeight: 40, fontSize: 14 }} pendingText="…">
                    <Icon name="trash" size={16} />
                    <span className="sr-only">Delete alert {a.label}</span>
                  </SubmitButton>
                </form>
              </div>
            );
          })}
        </main>
        <aside className="m-card" style={{ flex: "1 1 320px", maxWidth: "100%", padding: 24 }} aria-label="New alert">
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>New alert</h2>
          <AlertForm />
        </aside>
      </div>
    </div>
  );
}
