import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { DealArt } from "@/components/deals/DealArt";
import { DEAL_TYPES, PROPERTY_BY_ID } from "@/lib/config";
import { photoUrl } from "@/lib/storage";
import { cardMetrics, seekText, type Draft } from "./model";

export type WizardViewer = { id: string; name: string; color: string };

/** Live preview of how the deal will look in the Deal Room. */
export function Preview({ draft, viewer }: { draft: Draft; viewer: WizardViewer }) {
  const t = DEAL_TYPES[draft.type];
  const cover = draft.photos[0];
  const n = draft.photos.length;
  const place = [draft.city.trim(), draft.state.trim().toUpperCase()].filter(Boolean).join(", ") || "City, State";

  return (
    <article style={{ background: "#fff", border: "1px solid #E7EAF0", borderRadius: 22, overflow: "hidden", boxShadow: "0 14px 34px rgba(11,31,58,0.08)" }}>
      <div className="d-img" style={{ background: t.tint }}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl(cover.path)} alt="" />
        ) : (
          <DealArt type={draft.prop} />
        )}
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span className="d-pill" style={{ color: t.ink }}>
            <span className="d-dot" style={{ background: t.dot }} />
            {t.name}
          </span>
          {draft.type === "sale" && draft.market === "off" && (
            <span className="d-pill" style={{ background: "#0B1F3A", color: "#fff" }}>
              <Icon name="lock" size={12} strokeWidth={2.6} />
              Off-market
            </span>
          )}
        </div>
        <span style={{ position: "absolute", left: 12, bottom: 12, fontSize: 12, fontWeight: 700, color: "#fff", background: "rgba(11,31,58,0.78)", padding: "5px 10px", borderRadius: 999 }}>
          {n === 0 ? "No photos yet" : `${n} ${n === 1 ? "photo" : "photos"}`}
        </span>
      </div>
      <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#5E6B7E" }}>
          {place} · {PROPERTY_BY_ID[draft.prop].name} · Just now
        </span>
        <b style={{ fontSize: 17, lineHeight: 1.35, letterSpacing: "-0.01em", color: draft.title.trim() ? "#0F1B2D" : "#8A96A8" }}>
          {draft.title.trim() || "Your headline shows here"}
        </b>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {cardMetrics(draft).map((m, i) => (
            <div key={i} className="d-m">
              <span>{m.l}</span>
              <b style={{ color: m.c ?? "#0F1B2D" }}>{m.v}</b>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: t.tint, borderRadius: 12, padding: "10px 12px", fontSize: 13, lineHeight: 1.45, color: t.ink }}>
          <span>
            <b>Looking for:</b> {seekText(draft).toLowerCase() || "not set yet"}
          </span>
        </div>
        <div style={{ paddingTop: 12, borderTop: "1px solid #EEF1F5", display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={viewer.name} color={viewer.color} size={36} radius={12} fontSize={12} />
          <span style={{ flex: 1, lineHeight: 1.3, minWidth: 0 }}>
            <b style={{ display: "block", fontSize: 14 }}>{viewer.name}</b>
            <span style={{ fontSize: 12, color: "#5E6B7E" }}>That&apos;s you</span>
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: "#0B1F3A", borderRadius: 11, padding: "10px 14px", whiteSpace: "nowrap" }}>{t.req}</span>
        </div>
      </div>
    </article>
  );
}
