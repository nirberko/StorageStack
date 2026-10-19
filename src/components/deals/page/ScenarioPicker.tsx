"use client";

import { useDeal } from "@/components/deals/page/DealContext";
import { money } from "@/lib/format";

export function ScenarioPicker({ scenarios, years }: { scenarios: { id: string; label: string; rate: string; mult: number }[]; years: number }) {
  const d = useDeal();
  return (
    <>
      <h3 className="x-h3">What your money could do</h3>
      <p className="x-sub" style={{ marginTop: 0 }}>
        Pick a scenario. Based on {money(d.amountK * 1000)} invested for {years} years.
      </p>
      <div role="group" aria-label="Return scenarios" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
        {scenarios.map((c) => (
          <button key={c.id} className={`x-scen${c.id === d.scenario ? " on" : ""}`} type="button" aria-pressed={c.id === d.scenario} onClick={() => d.setScenario(c.id)}>
            <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#5E6B7E" }}>{c.label}</span>
            <b style={{ display: "block", fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 4 }}>{money(d.amountK * 1000 * c.mult)}</b>
            <span style={{ display: "block", fontSize: 13, color: "#4A576B", marginTop: 2 }}>
              {c.rate} · {c.mult}x your money
            </span>
          </button>
        ))}
      </div>
      <p style={{ marginTop: 14, fontSize: 12, lineHeight: 1.5, color: "#5E6B7E" }}>
        Estimates only, not a promise. Real results can be lower and you can lose money.
      </p>
    </>
  );
}
