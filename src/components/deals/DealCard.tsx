import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { Verified } from "@/components/Verified";
import { DealArt } from "@/components/deals/DealArt";
import { DealRequestButton, DealSaveButton } from "@/components/deals/DealButtons";
import { DEAL_TYPES, PROPERTY_BY_ID } from "@/lib/config";
import { money, timeAgo } from "@/lib/format";
import { photoUrl } from "@/lib/storage";
import type { Author, Deal, DealPhoto, Metric } from "@/lib/types";

export type DealCardData = Deal & { poster: Author | null };

export function DealCard({
  deal: d, saved, requested, viewerId,
}: { deal: DealCardData; saved: boolean; requested: boolean; viewerId?: string }) {
  const t = DEAL_TYPES[d.type];
  const metrics = (d.metrics as Metric[] | null) ?? [];
  const photos = (d.photos as DealPhoto[] | null) ?? [];
  const pct = d.raise_goal ? Math.min(100, Math.round(((d.raise_committed ?? 0) / d.raise_goal) * 100)) : 0;
  const own = viewerId === d.poster_id;

  return (
    <article className="d-card">
      <div className="d-img" style={{ background: t.tint }}>
        {photos[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl(photos[0].path)} alt={photos[0].label || d.title} />
        ) : (
          <DealArt type={d.property_type} />
        )}
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6, flexWrap: "wrap", paddingRight: 56 }}>
          <span className="d-pill" style={{ color: t.ink }}>
            <span className="d-dot" style={{ background: t.dot }} />
            {t.name}
          </span>
          {d.off_market && (
            <span className="d-pill" style={{ background: "#0B1F3A", color: "#fff" }}>
              <Icon name="lock" size={12} strokeWidth={2.6} />
              Off-market
            </span>
          )}
          {d.status === "closed" && (
            <span className="d-pill" style={{ background: "#DDF3E8", color: "#17603F" }}>
              Closed
            </span>
          )}
        </div>
        <DealSaveButton dealId={d.id} saved={saved} />
        <span style={{ position: "absolute", left: 12, bottom: 12, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#fff", background: "rgba(11,31,58,0.78)", padding: "5px 10px", borderRadius: 999 }}>
          <Icon name="eye" size={13} strokeWidth={2.2} />
          {d.interest_count} interested
        </span>
      </div>
      <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#5E6B7E", fontWeight: 600 }}>
          <Icon name="pin" size={14} strokeWidth={2.2} />
          <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {d.city}, {d.state} · {PROPERTY_BY_ID[d.property_type].name}
          </span>
          <span style={{ marginLeft: "auto", whiteSpace: "nowrap" }}>{timeAgo(d.created_at)}</span>
        </div>
        <Link className="m-title" href={`/deals/${d.id}`}>
          {d.title}
        </Link>
        {metrics.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {metrics.slice(0, 4).map((m, i) => (
              <div key={i} className="d-m">
                <span>{m.l}</span>
                <b style={{ color: m.c ?? "#0F1B2D" }}>{m.v}</b>
              </div>
            ))}
          </div>
        )}
        {d.raise_goal ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 13, color: "#5E6B7E", marginBottom: 8 }}>
              <span>
                <b style={{ color: "#0F1B2D", fontSize: 15 }}>{money(d.raise_committed ?? 0)}</b> committed of {money(d.raise_goal)}
              </span>
              <b style={{ color: "#17603F" }}>{pct}%</b>
            </div>
            <div className="d-bar" role="progressbar" aria-label="Money committed" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
              <span style={{ width: `${pct}%` }} />
            </div>
            {d.raise_note && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#5E6B7E", fontWeight: 600 }}>
                {d.interest_count} investors interested · {d.raise_note}
              </div>
            )}
          </div>
        ) : null}
        {d.seek && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: t.tint, borderRadius: 12, padding: "10px 12px", fontSize: 13, lineHeight: 1.45, color: t.ink }}>
            <Icon name="people" size={16} strokeWidth={2.2} style={{ flex: "none", marginTop: 1 }} />
            <span>
              <b>Looking for:</b> {d.seek}
            </span>
          </div>
        )}
        <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid #EEF1F5", display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={d.poster?.full_name ?? "?"} color={d.poster?.avatar_color ?? "#E6EBF3"} size={38} radius={12} fontSize={13} />
          <span style={{ flex: 1, minWidth: 0, lineHeight: 1.3 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 800, fontSize: 14, whiteSpace: "nowrap" }}>
              {d.poster ? <Link href={`/u/${d.poster.id}`}>{d.poster.full_name}</Link> : "Former member"}
              {d.poster?.verified && <Verified size={15} label="Verified" />}
            </span>
            <span style={{ display: "block", fontSize: 12, color: "#5E6B7E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {d.poster?.headline}
            </span>
          </span>
          {d.status === "live" && <DealRequestButton dealId={d.id} requested={requested} label={t.req} own={own} />}
        </div>
      </div>
    </article>
  );
}
