import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { leavePartners } from "@/app/actions/deal-page";
import { Icon } from "@/components/Icon";
import { PartnerForm } from "@/components/deals/page/PartnerForm";
import { SubmitButton } from "@/components/deals/page/SubmitButton";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Join as a capital partner" };

export default async function JoinPartnersPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/deals/partners/join");
  const supabase = await createClient();
  const { data: current } = await supabase.from("capital_partners").select("*").eq("profile_id", viewer.id).maybeSingle();

  return (
    <div className="wrap" style={{ paddingTop: 22, paddingBottom: 64 }}>
      <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#5E6B7E" }}>
        <Link href="/deals?tab=partners" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#5E6B7E" }}>
          <Icon name="back" size={16} strokeWidth={2.2} />
          Capital partners
        </Link>
        <span aria-hidden="true">/</span>
        <span style={{ color: "#0F1B2D" }}>{current ? "Your partner profile" : "Join"}</span>
      </nav>
      <h1 style={{ marginTop: 12, fontSize: 36, lineHeight: 1.1, fontWeight: 800, letterSpacing: "-0.03em" }}>
        {current ? "Your capital partner profile" : "Join as a capital partner"}
      </h1>
      <p style={{ marginTop: 8, fontSize: 16, color: "#5E6B7E", maxWidth: 680 }}>
        Investors, lenders and operators who are actively looking for deals. Members with a deal can find you and send a request.
      </p>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start", marginTop: 24 }}>
        <main className="m-card p-card" style={{ flex: "999 1 560px", minWidth: 0, padding: "32px 36px" }}>
          <PartnerForm current={current} />
        </main>
        <aside style={{ flex: "1 1 300px", maxWidth: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="m-card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>How it works</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                ["Show up in Capital partners", "Your card lists what you invest, lend or bring and what you look for."],
                ["Members reach out", "They send a request to connect. You decide who to talk to."],
                ["Talk it through", "Ask the forum for a second opinion, then close with your own team."],
              ].map(([title, text], i) => (
                <div key={title} style={{ display: "flex", gap: 12 }}>
                  <span className="d-step" style={{ background: ["#FFEDE2", "#DDF3E8", "#E6EEFD"][i], color: ["#B5440A", "#17603F", "#1D4ED8"][i] }}>{i + 1}</span>
                  <span style={{ fontSize: 14, lineHeight: 1.5, color: "#4A576B" }}>
                    <b style={{ display: "block", color: "#0F1B2D" }}>{title}</b>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {current && (
            <form action={leavePartners} className="m-card" style={{ padding: 20 }}>
              <b style={{ display: "block", fontSize: 15 }}>Not looking right now?</b>
              <p style={{ marginTop: 6, fontSize: 14, color: "#4A576B", lineHeight: 1.5 }}>Remove your card from Capital partners. You can join again any time.</p>
              <SubmitButton className="m-btn m-btn-s" style={{ marginTop: 12, width: "100%" }} pendingText="Removing…">
                Remove my card
              </SubmitButton>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
