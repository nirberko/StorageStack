"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { useDeal } from "@/components/deals/page/DealContext";
import { money } from "@/lib/format";
import type { Metric } from "@/lib/types";

function RequestButton({ label, doneLabel }: { label: string; doneLabel: string }) {
  const d = useDeal();
  if (d.own) {
    return (
      <Link className="m-btn m-btn-n" href="/deals/mine" style={{ width: "100%", marginTop: 16, minHeight: 50, fontSize: 16 }}>
        Manage requests
      </Link>
    );
  }
  return (
    <>
      <button
        className={`m-btn ${d.requested ? "done" : "m-btn-o"}`}
        type="button"
        onClick={d.toggleRequest}
        aria-pressed={d.requested}
        style={{ width: "100%", marginTop: 16, minHeight: 50, fontSize: 16 }}
      >
        {d.requested && <Icon name="check" size={17} strokeWidth={3} />}
        {d.requested ? doneLabel : label}
      </button>
      {d.error && (
        <p role="alert" style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: "#A82A2A" }}>
          {d.error}
        </p>
      )}
    </>
  );
}

function MessageLink({ posterId, firstName }: { posterId: string; firstName: string }) {
  const d = useDeal();
  if (d.own) return null;
  return (
    <Link className="m-btn m-btn-s" href={`/u/${posterId}`} style={{ width: "100%", marginTop: 8 }}>
      Message {firstName}
    </Link>
  );
}

/** The rail card on a "Raising money" deal. */
export function InvestCard({
  goal, committed, closesNote, interest, minK, expectedMult, posterId, firstName,
}: {
  goal: number; committed: number; closesNote: string; interest: number; minK: number; expectedMult: number | null;
  posterId: string; firstName: string;
}) {
  const d = useDeal();
  const pct = goal ? Math.min(100, Math.round((committed / goal) * 100)) : 0;
  const investors = interest - (d.initiallyRequested ? 1 : 0) + (d.requested ? 1 : 0);
  const amounts = [1, 2, 5, 10].map((m) => minK * m);

  return (
    <div className="m-card" style={{ padding: 24, boxShadow: "0 14px 40px rgba(11,31,58,0.08)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#5E6B7E" }}>Raising</span>
        {closesNote && <span style={{ fontSize: 13, fontWeight: 800, color: "#B5440A" }}>{closesNote}</span>}
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 2 }}>{money(goal)}</div>
      <div className="d-bar lg" role="progressbar" aria-label="Money committed" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} style={{ marginTop: 14 }}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 13, color: "#5E6B7E", fontWeight: 600 }}>
        <span>
          <b style={{ color: "#0F1B2D" }}>{money(committed)}</b> committed · {pct}%
        </span>
        <span>
          {investors} {investors === 1 ? "investor" : "investors"} interested
        </span>
      </div>
      <div style={{ height: 1, background: "#EEF1F5", margin: "20px 0" }} />
      <span id="amount-label" style={{ display: "block", fontSize: 14, fontWeight: 800 }}>
        How much are you thinking of investing?
      </span>
      <div role="group" aria-labelledby="amount-label" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
        {amounts.map((k) => (
          <button key={k} className={`d-chip${k === d.amountK ? " on" : ""}`} style={{ minHeight: 40 }} type="button" aria-pressed={k === d.amountK} onClick={() => d.setAmountK(k)}>
            {money(k * 1000)}
          </button>
        ))}
      </div>
      {expectedMult && (
        <div style={{ marginTop: 14, background: "#F5FBF8", borderRadius: 14, padding: "12px 14px", fontSize: 13, lineHeight: 1.5, color: "#17603F" }}>
          Could grow to about <b style={{ fontSize: 16 }}>{money(d.amountK * 1000 * expectedMult)}</b> at the sponsor&apos;s expected return.
        </div>
      )}
      <RequestButton label="I'm interested" doneLabel="You're on the list" />
      <MessageLink posterId={posterId} firstName={firstName} />
      <p style={{ marginTop: 14, fontSize: 12, lineHeight: 1.5, color: "#5E6B7E" }}>
        Saying you are interested is not a commitment. {firstName} will send you the full documents to review first.
      </p>
    </div>
  );
}

/** The rail card on sale, partner and loan deals. */
export function ActionCard({
  amountLabel, amount, metrics, cta, note, interest, posterId, firstName,
}: {
  amountLabel: string; amount: number; metrics: Metric[]; cta: string; note: string; interest: number; posterId: string; firstName: string;
}) {
  const d = useDeal();
  const n = interest - (d.initiallyRequested ? 1 : 0) + (d.requested ? 1 : 0);
  return (
    <div className="m-card" style={{ padding: 24, boxShadow: "0 14px 40px rgba(11,31,58,0.08)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#5E6B7E" }}>{amountLabel}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#17603F" }}>{n} interested</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 2 }}>{amount ? money(amount) : "Open to offers"}</div>
      {metrics.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 }}>
          {metrics.slice(0, 4).map((m, i) => (
            <div key={i} className="d-m">
              <span>{m.l}</span>
              <b style={{ color: m.c ?? "#0F1B2D" }}>{m.v}</b>
            </div>
          ))}
        </div>
      )}
      <RequestButton label={cta} doneLabel="Request sent" />
      <MessageLink posterId={posterId} firstName={firstName} />
      <p style={{ marginTop: 14, fontSize: 12, lineHeight: 1.5, color: "#5E6B7E" }}>{note}</p>
    </div>
  );
}
