import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Verified } from "@/components/Verified";
import { ConnectButton } from "@/components/deals/DealButtons";
import { PARTNER_KINDS } from "@/lib/config";
import type { Author, CapitalPartner } from "@/lib/types";

export type PartnerCardData = CapitalPartner & { profile: (Author & { location: string }) | null };

export function PartnerCard({ partner: p, connected, viewerId }: { partner: PartnerCardData; connected: boolean; viewerId?: string }) {
  const kind = PARTNER_KINDS[p.kind] ?? PARTNER_KINDS.Investor;
  const name = p.profile?.full_name ?? "Member";
  return (
    <article className="d-card" style={{ padding: 20, gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar name={name} color={p.profile?.avatar_color ?? "#E6EBF3"} size={48} radius={15} fontSize={15} />
        <span style={{ flex: 1, minWidth: 0, lineHeight: 1.3 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 800, fontSize: 16 }}>
            <Link href={`/u/${p.profile_id}`}>{name}</Link>
            {p.profile?.verified && <Verified size={15} label="Verified" />}
          </span>
          <span style={{ display: "block", fontSize: 13, color: "#5E6B7E" }}>{p.profile?.location || p.profile?.headline}</span>
        </span>
        <span className="d-pill" style={{ background: kind.tint, color: kind.ink }}>
          {p.kind}
        </span>
      </div>
      <div style={{ background: "#F5F6FA", borderRadius: 14, padding: "12px 14px" }}>
        <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#5E6B7E" }}>{p.offer_label}</span>
        <b style={{ display: "block", fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em", marginTop: 2 }}>{p.offer}</b>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.55, color: "#4A576B" }}>{p.about}</p>
      {p.focus.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {p.focus.map((f) => (
            <span key={f} className="m-tag">
              {f}
            </span>
          ))}
        </div>
      )}
      <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid #EEF1F5", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: "#5E6B7E", lineHeight: 1.45 }}>
          <b style={{ display: "block", fontSize: 13, color: "#1E2B3F" }}>{p.track_record}</b>
          {p.reply_time}
        </span>
        <ConnectButton partnerId={p.profile_id} connected={connected} own={viewerId === p.profile_id} />
      </div>
    </article>
  );
}
