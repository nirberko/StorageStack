"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { GalleryArt, type ArtKey } from "@/components/deals/page/Illustrations";

export type GalleryItem = { label: string; url?: string; art?: ArtKey; bg: string; icon: string };

export function Gallery({ items, illustrated }: { items: GalleryItem[]; illustrated: boolean }) {
  const [idx, setIdx] = useState(0);
  const cur = items[idx] ?? items[0];
  const thumbs = items.slice(0, 4);

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
      <div style={{ flex: "999 1 640px", position: "relative", height: "clamp(240px, 42vw, 430px)", borderRadius: 24, overflow: "hidden", background: cur.bg }}>
        {cur.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cur.url} alt={cur.label} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <GalleryArt art={cur.art ?? "ext"} />
        )}
        <span style={{ position: "absolute", left: 16, bottom: 16, display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#fff", background: "rgba(11,31,58,0.78)", padding: "7px 12px", borderRadius: 999 }}>
          {illustrated ? `Illustration · ${cur.label} · no photos posted yet` : `Photo ${idx + 1} of ${items.length} · ${cur.label}`}
        </span>
      </div>
      {thumbs.length > 1 && (
        <div style={{ flex: "1 1 300px", display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 12, minHeight: 260 }}>
          {thumbs.map((t, i) => (
            <button
              key={i}
              className={`x-thumb${i === idx ? " on" : ""}`}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Show ${illustrated ? "illustration" : "photo"}: ${t.label}`}
              aria-pressed={i === idx}
              style={{ background: t.bg }}
            >
              {t.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.url} alt="" />
              ) : (
                <>
                  <span style={{ width: 44, height: 44, borderRadius: 14, background: "#fff", display: "grid", placeItems: "center" }}>
                    <Icon d={t.icon} size={22} stroke="#0B1F3A" />
                  </span>
                  {t.label}
                </>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
