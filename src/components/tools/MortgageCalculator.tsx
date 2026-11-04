"use client";

import { useId, useState } from "react";
import { calculate, isValid, type MortgageInput } from "@/lib/mortgage";

const AMORTIZATION = [15, 20, 25, 30];
const TERMS = [5, 7, 10, 15];

/** "$1,234,567" */
function usd(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

/** Keeps digits and one decimal point, and groups thousands while typing: "2400000" -> "2,400,000". */
function typed(raw: string, group: boolean): string {
  const clean = raw.replace(/[^0-9.]/g, "");
  const [int, ...rest] = clean.split(".");
  const dec = rest.length ? "." + rest.join("") : "";
  const intOut = group ? int.replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",") : int;
  return intOut + dec;
}

function num(s: string): number {
  return s.trim() === "" ? NaN : Number(s.replace(/,/g, ""));
}

export function MortgageCalculator() {
  const [price, setPrice] = useState("2,400,000");
  const [down, setDown] = useState("25");
  const [rate, setRate] = useState("7");
  const [amort, setAmort] = useState(25);
  const [term, setTerm] = useState<number | null>(10);
  const [noi, setNoi] = useState("");

  const input: MortgageInput = {
    price: num(price),
    downPct: num(down),
    ratePct: num(rate),
    amortYears: amort,
    termYears: term,
    noi: noi.trim() ? num(noi) : null,
  };
  const result = isValid(input) ? calculate(input) : null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
      <section className="x-sec" style={{ flex: "1 1 420px", minWidth: 0 }} aria-labelledby="mc-loan">
        <h2 id="mc-loan" className="x-h2">
          The loan
        </h2>
        <p className="x-sub">Fixed rate, monthly payments.</p>
        <div style={{ display: "grid", gap: 18, marginTop: 20 }}>
          <Field label="Purchase price" prefix="$" value={price} onChange={(v) => setPrice(typed(v, true))} />
          <Field
            label="Down payment"
            suffix="%"
            value={down}
            onChange={(v) => setDown(typed(v, false))}
            help={Number.isFinite(input.price) && Number.isFinite(input.downPct) ? `${usd((input.price * input.downPct) / 100)} down` : undefined}
          />
          <Field label="Interest rate" suffix="%" value={rate} onChange={(v) => setRate(typed(v, false))} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 18 }}>
            <Select label="Amortization" value={String(amort)} onChange={(v) => {
                const years = Number(v);
                setAmort(years);
                // A term as long as the amortization is no balloon, so it goes back to "Same as amortization".
                if (term !== null && term >= years) setTerm(null);
              }}>
              {AMORTIZATION.map((y) => (
                <option key={y} value={y}>
                  {y} years
                </option>
              ))}
            </Select>
            <Select
              label="Loan term"
              value={term === null ? "" : String(term)}
              onChange={(v) => setTerm(v ? Number(v) : null)}
              help="When the remaining balance is due"
            >
              <option value="">Same as amortization</option>
              {TERMS.filter((y) => y < amort).map((y) => (
                <option key={y} value={y}>
                  {y} years
                </option>
              ))}
            </Select>
          </div>
          <Field
            label="Net operating income (optional)"
            prefix="$"
            suffix="/ yr"
            value={noi}
            onChange={(v) => setNoi(typed(v, true))}
            help="Add it to see your debt service coverage ratio."
            placeholder="e.g. 194,000"
          />
        </div>
      </section>

      <section className="m-card" style={{ flex: "1 1 380px", minWidth: 0, padding: 28 }} aria-labelledby="mc-result" aria-live="polite">
        <h2 id="mc-result" className="x-h2">
          Your payment
        </h2>
        {result ? (
          <>
            <div style={{ marginTop: 16, padding: "20px 22px", borderRadius: 18, background: "#0B1F3A", color: "#fff" }}>
              <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#C5D1E3" }}>Monthly payment</span>
              <b style={{ display: "block", fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginTop: 4 }}>
                {usd(result.monthlyPayment)}
              </b>
              <span style={{ display: "block", fontSize: 14, color: "#C5D1E3", marginTop: 4 }}>{usd(result.annualDebtService)} a year</span>
            </div>
            <div style={{ marginTop: 14 }}>
              <Row label="Loan amount" value={usd(result.loan)} />
              <Row label="Down payment" value={usd(result.downPayment)} />
              <Row label={`Total interest over ${amort} years`} value={usd(result.totalInterest)} />
              {result.balloon !== null && term !== null && <Row label={`Balance due after ${term} years`} value={usd(result.balloon)} strong />}
              {result.dscr !== null && <Dscr dscr={result.dscr} />}
            </div>
          </>
        ) : (
          <p className="x-sub" style={{ marginTop: 14 }}>
            Enter a price, a down payment from 0 to 100% and an interest rate to see the payment.
          </p>
        )}
      </section>

      {result && result.loan > 0 && (
        <details className="x-sec" style={{ flex: "1 1 100%", minWidth: 0 }}>
          <summary style={{ cursor: "pointer", fontSize: 17, fontWeight: 800 }}>
            Year-by-year schedule{result.balloon !== null && term !== null ? ` (first ${term} years)` : ""}
          </summary>
          <div style={{ overflowX: "auto", marginTop: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, fontVariantNumeric: "tabular-nums", minWidth: 520 }}>
              <thead>
                <tr style={{ textAlign: "right", color: "#5E6B7E" }}>
                  <th style={{ ...cell, textAlign: "left" }}>Year</th>
                  <th style={cell}>Payments</th>
                  <th style={cell}>Interest</th>
                  <th style={cell}>Principal</th>
                  <th style={cell}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((y) => (
                  <tr key={y.year} style={{ textAlign: "right", borderTop: "1px solid #EEF1F5" }}>
                    <td style={{ ...cell, textAlign: "left", fontWeight: 700 }}>{y.year}</td>
                    <td style={cell}>{usd(y.payments)}</td>
                    <td style={cell}>{usd(y.interest)}</td>
                    <td style={cell}>{usd(y.principal)}</td>
                    <td style={{ ...cell, fontWeight: 700 }}>{usd(y.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}

const cell: React.CSSProperties = { padding: "10px 8px", fontWeight: 600 };

function Field({
  label,
  value,
  onChange,
  prefix,
  suffix,
  help,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  help?: string;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div>
      <label className="d-label" htmlFor={id}>
        {label}
      </label>
      <div className="p-adorn">
        {prefix && <span aria-hidden="true">{prefix}</span>}
        <input id={id} inputMode="decimal" autoComplete="off" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
        {suffix && <span aria-hidden="true">{suffix}</span>}
      </div>
      {help && <span className="d-help">{help}</span>}
    </div>
  );
}

function Select({ label, value, onChange, help, children }: { label: string; value: string; onChange: (v: string) => void; help?: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <div>
      <label className="d-label" htmlFor={id}>
        {label}
      </label>
      <select id={id} className="d-input" value={value} onChange={(e) => onChange(e.target.value)} style={{ fontWeight: 700 }}>
        {children}
      </select>
      {help && <span className="d-help">{help}</span>}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="d-row" style={{ justifyContent: "space-between" }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: "#4A576B" }}>{label}</span>
      <b style={{ fontSize: strong ? 17 : 15, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{value}</b>
    </div>
  );
}

/** Debt service coverage: lenders usually want income to cover the payments at least 1.25 times. */
function Dscr({ dscr }: { dscr: number }) {
  const tone =
    dscr >= 1.25
      ? { ink: "#17603F", tint: "#DDF3E8", note: "Meets the 1.25x most lenders look for." }
      : dscr >= 1
        ? { ink: "#8A5A12", tint: "#FBF1DD", note: "Covers the payments, but below the 1.25x most lenders want." }
        : { ink: "#A82A2A", tint: "#FCE5E5", note: "Income does not cover the payments." };
  return (
    <div className="d-row" style={{ flexWrap: "wrap", justifyContent: "space-between" }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: "#4A576B" }}>Debt service coverage</span>
      <span className="m-badge" style={{ background: tone.tint, color: tone.ink, fontSize: 15 }}>
        {dscr.toFixed(2)}x
      </span>
      <span style={{ flex: "1 1 100%", fontSize: 13, color: tone.ink }}>{tone.note}</span>
    </div>
  );
}
