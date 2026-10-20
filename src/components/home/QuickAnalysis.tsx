"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { ProPill } from "@/components/home/Pro";
import type { IconName } from "@/lib/icons";

const KINDS: { id: string; label: string; sub: string; noun: string; icon: IconName }[] = [
  { id: "purchase", label: "Buy a facility", sub: "Cap rate and cash flow", noun: "purchase", icon: "coin" },
  { id: "build", label: "Build new", sub: "Cost per sq ft and yield", noun: "build", icon: "build" },
  { id: "conversion", label: "Conversion", sub: "Cost to convert and fill", noun: "conversion", icon: "convert" },
  { id: "expansion", label: "Expansion", sub: "Return on added units", noun: "expansion", icon: "grid" },
];

export function QuickAnalysis() {
  const [kind, setKind] = useState(KINDS[0]);

  return (
    <section className="m-card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }} aria-labelledby="qa-title">
      {/* Not built yet: there is no deal calculator. The form sends the choice and address to /tools
          as ?type=&address= so the calculator can pick them up when it exists. */}
      <form action="/tools" style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="h-tile" style={{ background: "#FFEDE2" }}>
            <Icon name="calculator" size={22} stroke="#B5440A" />
          </span>
          <h2 id="qa-title" style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em" }}>
            Quick deal analysis
          </h2>
        </div>

        <div role="group" aria-labelledby="qa-step1">
          <span className="h-eyebrow" id="qa-step1" style={{ marginBottom: 10 }}>
            Step 1 · What kind of deal?
          </span>
          <input type="hidden" name="type" value={kind.id} />
          <div className="h-kinds">
            {KINDS.map((k) => (
              <button key={k.id} type="button" className="h-kind" aria-pressed={k.id === kind.id} onClick={() => setKind(k)}>
                <span className="m-ic" style={{ width: 36, height: 36, borderRadius: 11 }}>
                  <Icon name={k.icon} size={18} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <b>{k.label}</b>
                  <small>{k.sub}</small>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="h-eyebrow" htmlFor="qa-address" style={{ marginBottom: 10 }}>
            Step 2 · Facility address
          </label>
          <div className="p-adorn" style={{ paddingLeft: 12 }}>
            <Icon name="pin" size={18} stroke="#5E6B7E" style={{ flex: "none" }} />
            <input id="qa-address" name="address" autoComplete="street-address" placeholder="Start typing an address or city" style={{ fontWeight: 600 }} />
          </div>
          <span className="d-help">No address yet? Start anyway and add it later.</span>
        </div>

        <button type="submit" className="m-btn m-btn-o" style={{ width: "100%", minHeight: 48, marginTop: "auto" }}>
          Analyze this {kind.noun}
        </button>
      </form>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "14px 24px", background: "#FAFBFD", borderTop: "1px solid #EEF1F5" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#1E2B3F" }}>Save your analyses</span>
        <ProPill />
        <a className="m-btn m-btn-pro" href="#pro" style={{ marginLeft: "auto", minHeight: 44, padding: "0 14px", fontSize: 14 }}>
          Get early access
        </a>
      </div>
    </section>
  );
}
