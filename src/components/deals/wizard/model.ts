// Pure data model for the post-a-deal wizard, shared by the client wizard and the server action.

import { DEAL_TYPES, FEATURES, SEEK_OPTIONS } from "@/lib/config";
import { money } from "@/lib/format";
import type { DealDetails, DealType, Metric, PropertyType } from "@/lib/types";

export type UploadedFile = { path: string; name: string };

export type Draft = {
  type: DealType;
  prop: PropertyType;
  market: "off" | "on";
  title: string;
  city: string;
  state: string;
  region: string;
  address: string;
  size: Record<string, string>;
  features: string[];
  nums: Partial<Record<DealType, Record<string, string>>>;
  seek: string[];
  story: string;
  neededBy: string;
  vis: "approve" | "verified";
  photos: (UploadedFile & { label: string })[];
  docs: Record<string, UploadedFile>;
};

export const NEEDED_BY = ["Within 30 days", "Within 60 days", "Within 90 days", "No rush"];

export function emptyDraft(): Draft {
  return {
    type: "equity",
    prop: "facility",
    market: "off",
    title: "",
    city: "",
    state: "",
    region: "",
    address: "",
    size: {},
    features: [],
    nums: {},
    seek: [DEAL_TYPES.equity.seek],
    story: "",
    neededBy: "Within 60 days",
    vis: "approve",
    photos: [],
    docs: {},
  };
}

export type SizeField = { id: string; label: string; suf: string; placeholder: string };

export function sizeFields(type: DealType): SizeField[] {
  if (type === "debt") {
    return [
      { id: "land", label: "Lot size", suf: "acres", placeholder: "6.1" },
      { id: "units", label: "Spaces today", suf: "spaces", placeholder: "80" },
      { id: "unitsAfter", label: "Spaces after", suf: "spaces", placeholder: "200" },
      { id: "year", label: "Year built", suf: "—", placeholder: "2011" },
    ];
  }
  if (type === "jv") {
    return [
      { id: "bldg", label: "Planned size", suf: "sq ft", placeholder: "78,000" },
      { id: "units", label: "Planned units", suf: "units", placeholder: "560" },
      { id: "land", label: "Land", suf: "acres", placeholder: "4.2" },
      { id: "year", label: "Year built", suf: "—", placeholder: "New" },
    ];
  }
  return [
    { id: "bldg", label: "Building size", suf: "sq ft", placeholder: type === "sale" ? "38,000" : "52,000" },
    { id: "units", label: "Units", suf: "units", placeholder: type === "sale" ? "312" : "418" },
    { id: "land", label: "Land", suf: "acres", placeholder: type === "sale" ? "3.4" : "4.8" },
    { id: "year", label: "Year built", suf: "—", placeholder: type === "sale" ? "1998" : "2004" },
  ];
}

export type NumField = { id: string; label: string; pre?: string; suf?: string; hint?: string; placeholder: string; text?: boolean };

export const NUM_FIELDS: Record<DealType, NumField[]> = {
  sale: [
    { id: "price", label: "Asking price", pre: "$", placeholder: "2,400,000" },
    { id: "noi", label: "Net income, last 12 months", pre: "$", placeholder: "194,400", hint: "Rent collected minus expenses, before loan payments." },
    { id: "occ", label: "Occupancy", suf: "%", placeholder: "84" },
    { id: "rent", label: "Average rent per sq ft", pre: "$", suf: "/ yr", placeholder: "10.90" },
    { id: "gross", label: "Gross income, last 12 months", pre: "$", placeholder: "312,000" },
    { id: "exp", label: "Expenses, last 12 months", pre: "$", placeholder: "117,600", hint: "Taxes, insurance, payroll, utilities, repairs." },
  ],
  equity: [
    { id: "total", label: "Total project cost", pre: "$", placeholder: "5,630,000", hint: "Purchase, upgrades and closing costs." },
    { id: "raise", label: "Raising from investors", pre: "$", placeholder: "1,600,000" },
    { id: "min", label: "Minimum investment", pre: "$", placeholder: "50,000" },
    { id: "target", label: "Target yearly return", suf: "%", placeholder: "17", hint: "Be realistic. Members will ask how you got here." },
    { id: "hold", label: "Hold period", suf: "years", placeholder: "5" },
    { id: "sponsor", label: "Your own money in the deal", pre: "$", placeholder: "350,000", hint: "Investors like to see the sponsor invest too." },
  ],
  jv: [
    { id: "total", label: "Total deal size", pre: "$", placeholder: "6,200,000" },
    { id: "bring", label: "What you bring", pre: "$", placeholder: "750,000", hint: "Cash, land or both." },
    { id: "land", label: "Land size", suf: "acres", placeholder: "4.2" },
    { id: "bldg", label: "Planned building size", suf: "sq ft", placeholder: "78,000" },
    { id: "split", label: "Proposed split (you / partner)", placeholder: "60 / 40", hint: "You can leave this open to discuss.", text: true },
    { id: "open", label: "Expected time to open", suf: "months", placeholder: "18" },
  ],
  debt: [
    { id: "loan", label: "Loan amount", pre: "$", placeholder: "1,200,000" },
    { id: "value", label: "Property value today", pre: "$", placeholder: "1,850,000", hint: "From a recent appraisal or broker opinion." },
    { id: "term", label: "Loan term", suf: "months", placeholder: "24" },
    { id: "noi", label: "Net income today", pre: "$", suf: "/ yr", placeholder: "142,000" },
    { id: "noiAfter", label: "Net income after the project", pre: "$", suf: "/ yr", placeholder: "298,000" },
    { id: "close", label: "Need to close within", suf: "days", placeholder: "45" },
  ],
};

/** The field holding the deal's headline dollar figure (deals.amount). */
export const KEY_AMOUNT: Record<DealType, string> = { sale: "price", equity: "raise", jv: "total", debt: "loan" };

export const NUMBERS_SUB: Record<DealType, string> = {
  sale: "The basics buyers look at first. Use the last 12 months.",
  equity: "What investors need to decide if they want to see more.",
  jv: "What you bring and what a partner would get.",
  debt: "What lenders need to quote you.",
};

/** "2,400,000" / "$2.4m" -> 2400000. NaN when empty or not a number. */
export function num(raw: string | undefined): number {
  if (!raw) return NaN;
  const cleaned = raw.replace(/[^0-9.]/g, "");
  return cleaned ? parseFloat(cleaned) : NaN;
}

const ok = (n: number) => Number.isFinite(n) && n > 0;
const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;
const plainNum = (raw: string) => {
  const n = num(raw);
  return ok(n) ? n.toLocaleString("en-US") : raw.trim();
};

function formatField(f: NumField | SizeField, raw: string): string {
  if ("text" in f && f.text) return raw.trim();
  const n = num(raw);
  if (!Number.isFinite(n)) return raw.trim();
  const pre = "pre" in f ? f.pre : undefined;
  const suf = f.suf && f.suf !== "—" ? f.suf : "";
  let v = pre === "$" ? (n >= 10000 ? money(n) : "$" + raw.trim().replace(/^\$/, "")) : plainNum(raw);
  if (suf === "%") v += "%";
  else if (suf) v += " " + suf;
  return v;
}

export function numsOf(d: Draft): Record<string, string> {
  return d.nums[d.type] ?? {};
}

export type Calc = { l: string; v: string; h: string };

export function calcs(d: Draft): Calc[] {
  const n = numsOf(d);
  const g = (id: string) => num(n[id]);
  const sz = (id: string) => num(d.size[id]);
  const dash = "—";
  switch (d.type) {
    case "sale": {
      const price = g("price");
      const noi = g("noi");
      const bldg = sz("bldg");
      const units = sz("units");
      return [
        { l: "Cap rate", v: ok(price) && ok(noi) ? pct(noi / price) : dash, h: "Net income ÷ price" },
        { l: "Price per sq ft", v: ok(price) && ok(bldg) ? "$" + Math.round(price / bldg).toLocaleString("en-US") : dash, h: "Uses building size from step 2" },
        { l: "Price per unit", v: ok(price) && ok(units) ? "$" + Math.round(price / units).toLocaleString("en-US") : dash, h: ok(units) ? `${units.toLocaleString("en-US")} units` : "Uses units from step 2" },
      ];
    }
    case "equity": {
      const total = g("total");
      const raise = g("raise");
      const min = g("min");
      const sponsor = Number.isFinite(g("sponsor")) ? g("sponsor") : 0;
      const loan = total - raise - sponsor;
      return [
        { l: "Investors own", v: ok(total) && ok(raise) ? pct(raise / total) : dash, h: "of the total project" },
        { l: "Bank loan needed", v: ok(total) && ok(raise) && loan >= 0 ? money(loan) : dash, h: ok(total) && ok(raise) && loan >= 0 ? `${Math.round((loan / total) * 100)}% of the project` : "Total − investors − your money" },
        { l: "Investors at the minimum", v: ok(raise) && ok(min) ? `Up to ${Math.floor(raise / min).toLocaleString("en-US")}` : dash, h: ok(raise) && ok(min) ? `${money(raise)} ÷ ${money(min)}` : "Raise ÷ minimum" },
      ];
    }
    case "jv": {
      const total = g("total");
      const bring = g("bring");
      const bldg = ok(g("bldg")) ? g("bldg") : sz("bldg");
      return [
        { l: "Your share of the money", v: ok(total) && ok(bring) ? pct(bring / total) : dash, h: "of the total deal" },
        { l: "Cost per sq ft", v: ok(total) && ok(bldg) ? "$" + Math.round(total / bldg).toLocaleString("en-US") : dash, h: "Total ÷ planned size" },
        { l: "Partner needs to bring", v: ok(total) && ok(bring) && total >= bring ? money(total - bring) : dash, h: "Cash or loan guarantee" },
      ];
    }
    case "debt": {
      const loan = g("loan");
      const value = g("value");
      const after = g("noiAfter");
      return [
        { l: "Loan to value", v: ok(loan) && ok(value) ? pct(loan / value) : dash, h: "Loan ÷ value" },
        { l: "Income covers payments", v: ok(loan) && ok(after) ? `${Math.round((after / (loan * 0.09)) * 10) / 10}x` : dash, h: "At 9% interest only" },
        { l: "Value after project", v: ok(after) ? money(after / 0.0875) : dash, h: "At an 8.75% cap rate" },
      ];
    }
  }
}

const GREEN = "#17603F";

/** The four figures shown on the Deal Room card. Missing values are "—". */
export function cardMetrics(d: Draft): Metric[] {
  const n = numsOf(d);
  const g = (id: string) => num(n[id]);
  const sz = (id: string) => num(d.size[id]);
  const c = calcs(d);
  const m = (l: string, v: number | string, fmt: (x: number) => string, color?: string): Metric => {
    const val = typeof v === "string" ? v.trim() || "—" : ok(v) ? fmt(v) : "—";
    return color && val !== "—" ? { l, v: val, c: color } : { l, v: val };
  };
  const nf = (x: number) => x.toLocaleString("en-US");
  switch (d.type) {
    case "sale":
      return [
        m("Asking", g("price"), money),
        m("Cap rate", c[0].v === "—" ? "" : c[0].v, nf, GREEN),
        m("Occupancy", g("occ"), (x) => `${x}%`),
        ok(sz("units")) ? m("Units", sz("units"), nf) : m("Size", sz("bldg"), (x) => `${Math.round(x / 1000)}k sq ft`),
      ];
    case "equity":
      return [
        m("Raising", g("raise"), money),
        m("Min. investment", g("min"), money),
        m("Target return", g("target"), (x) => `${x}% / yr`, GREEN),
        m("Hold", g("hold"), (x) => `${x} ${x === 1 ? "year" : "years"}`),
      ];
    case "jv": {
      const land = ok(g("land")) ? g("land") : sz("land");
      const bldg = ok(g("bldg")) ? g("bldg") : sz("bldg");
      return [
        m("Land", land, (x) => `${x} acres`),
        m("Planned", bldg, (x) => (x >= 1000 ? `${Math.round(x / 1000)}k sq ft` : `${x} sq ft`)),
        m("Bringing", g("bring"), money),
        n.split?.trim() ? m("Split", n.split, nf) : m("Deal size", g("total"), money),
      ];
    }
    case "debt":
      return [
        m("Loan", g("loan"), money),
        m("Loan to value", c[0].v === "—" ? "" : c[0].v, nf),
        m("Term", g("term"), (x) => `${x} months`),
        ok(sz("unitsAfter")) ? m("Spaces", sz("unitsAfter"), nf) : m("Value", g("value"), money),
      ];
  }
}

export function seekLabels(d: Draft): string[] {
  return SEEK_OPTIONS.filter((o) => d.seek.includes(o.id)).map((o) => o.label);
}

export function seekText(d: Draft): string {
  const s = seekLabels(d).join(", ");
  return s ? s.charAt(0) + s.slice(1).toLowerCase() : "";
}

export const DOC_SLOTS = (type: DealType) => [
  { id: "rent", name: "Rent roll", ext: "XLS", meta: "Every unit, size and what the tenant pays" },
  { id: "pl", name: "Last 12 months income and expenses", ext: "XLS", meta: "A P&L or bank statements are fine" },
  { id: "memo", name: type === "equity" ? "Investor summary" : "Deal summary", ext: "PDF", meta: "Optional. Your plan and the numbers in one place" },
  { id: "site", name: "Site plan or survey", ext: "PDF", meta: "Optional" },
];

export function extOf(filename: string): string {
  const m = /\.([a-z0-9]{1,5})$/i.exec(filename);
  if (!m) return "FILE";
  const e = m[1].toUpperCase();
  return e === "XLSX" ? "XLS" : e === "DOCX" ? "DOC" : e;
}

export type StepErrors = Record<string, string>;

/** Errors for one step (1-based). Empty object means the step is complete. */
export function validateStep(d: Draft, step: number): StepErrors {
  const e: StepErrors = {};
  if (step === 2) {
    if (d.title.trim().length < 8) e.title = "Write a headline of at least 8 characters.";
    if (d.title.trim().length > 140) e.title = "Keep the headline under 140 characters.";
    if (!d.city.trim()) e.city = "Add the city.";
    if (!d.state.trim()) e.state = "Add the state.";
  }
  if (step === 3) {
    const key = KEY_AMOUNT[d.type];
    if (!ok(num(numsOf(d)[key]))) {
      const f = NUM_FIELDS[d.type].find((x) => x.id === key)!;
      e[key] = `Add the ${f.label.toLowerCase()}.`;
    }
  }
  return e;
}

/** Everything the server writes to deals.*, derived from the draft. */
export function toDealRecord(d: Draft) {
  const n = numsOf(d);
  const t = DEAL_TYPES[d.type];
  const amount = num(n[KEY_AMOUNT[d.type]]);
  const metrics = cardMetrics(d).filter((m) => m.v !== "—");
  const fields = NUM_FIELDS[d.type];
  const keyStats: Metric[] = fields
    .filter((f) => n[f.id]?.trim())
    .map((f) => ({ l: f.label, v: formatField(f, n[f.id]) }));
  const firstCalc = calcs(d).find((c) => c.v !== "—");
  if (firstCalc) keyStats.push({ l: firstCalc.l, v: firstCalc.v });

  const details: DealDetails = {
    key_stats: keyStats.slice(0, 6),
    size: sizeFields(d.type)
      .filter((f) => d.size[f.id]?.trim())
      .map((f) => ({ label: f.label, value: d.size[f.id].trim(), suffix: f.suf === "—" ? "" : f.suf })),
    tags: FEATURES.filter((f) => d.features.includes(f.id)).map((f) => f.label),
  };

  let raiseNote = "";
  const closes = d.neededBy && d.neededBy !== "No rush" ? `Closes ${d.neededBy.toLowerCase()}` : "";
  if (d.type === "equity") {
    const target = num(n.target);
    const hold = num(n.hold);
    const min = num(n.min);
    const total = num(n.total);
    const sponsor = Number.isFinite(num(n.sponsor)) ? num(n.sponsor) : 0;
    if (ok(min)) details.min_investment = Math.round(min / 1000);
    if (ok(hold)) details.hold_years = hold;
    if (ok(target) && ok(hold)) {
      const mult = (r: number) => Math.round(Math.pow(1 + Math.max(r, 0) / 100, hold) * 10) / 10;
      details.scenarios = [
        { id: "low", label: "If things go slower", rate: `${Math.max(target - 5, 0)}% / yr`, mult: mult(target - 5) },
        { id: "exp", label: "Expected", rate: `${target}% / yr`, mult: mult(target) },
        { id: "high", label: "If things go well", rate: `${target + 5}% / yr`, mult: mult(target + 5) },
      ];
    }
    if (ok(total) && ok(amount) && total >= amount + sponsor) {
      const loan = total - amount - sponsor;
      const p = (x: number) => Math.round((x / total) * 100);
      details.capital_stack = {
        total: money(total),
        parts: [
          { label: "Bank loan", amount: money(loan), pct: p(loan), note: "", color: "#0B1F3A" },
          { label: "Investors", amount: money(amount), pct: p(amount), note: "this raise", color: "#16855A" },
          ...(sponsor > 0 ? [{ label: "Sponsor", amount: money(sponsor), pct: p(sponsor), note: "the sponsor's own money", color: "#DB520B" }] : []),
        ],
      };
    }
    raiseNote = closes.toLowerCase();
  }

  return {
    type: d.type,
    property_type: d.prop,
    off_market: d.type === "sale" && d.market === "off",
    visibility: d.vis,
    title: d.title.trim(),
    city: d.city.trim(),
    state: d.state.trim().toUpperCase().slice(0, 30),
    region: d.region,
    story: d.story.trim(),
    amount: ok(amount) ? amount : 0,
    raise_goal: d.type === "equity" && ok(amount) ? amount : null,
    raise_committed: d.type === "equity" ? 0 : null,
    raise_note: raiseNote,
    closes_note: closes,
    seek: d.type === "sale" && d.seek.length === 1 && d.seek[0] === t.seek ? "" : seekText(d),
    seeking: d.seek,
    needed_by: d.neededBy,
    features: d.features,
    metrics,
    details,
    photos: d.photos.map((p) => ({ path: p.path, label: p.label })),
  };
}
