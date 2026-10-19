"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { publishDeal } from "@/app/actions/post-deal";
import { Icon } from "@/components/Icon";
import { DEAL_TYPE_IDS, DEAL_TYPES, FEATURES, PROPERTY_BY_ID, PROPERTY_TYPES, REGIONS, SEEK_OPTIONS } from "@/lib/config";
import type { DealType } from "@/lib/types";
import {
  calcs, cardMetrics, emptyDraft, NEEDED_BY, NUM_FIELDS, NUMBERS_SUB, numsOf, seekText, sizeFields, validateStep,
  type Draft, type StepErrors,
} from "./model";
import { Preview, type WizardViewer } from "./Preview";
import { DocumentUploads, PhotoUploads } from "./Uploads";

const DRAFT_KEY = "storagestack:deal-draft:v1";

const STEPS = [
  { title: "Deal type", sub: "What you are posting" },
  { title: "Property", sub: "Where and what" },
  { title: "Numbers", sub: "The key figures" },
  { title: "What you need", sub: "Money, partner or buyer" },
  { title: "Photos & files", sub: "Public photos, private files" },
  { title: "Check and post", sub: "One last look" },
];

const TIPS: Record<number, string[]> = {
  1: ["Posting the same property for sale and looking for a partner? Make two posts.", "Brokers can post too. Just say so in the headline."],
  2: ["Keep the address private. Most sellers do.", "Headlines with a reason (“owner retiring”) get more clicks than ones with just a size."],
  3: ["Use real numbers from the last 12 months, not projections.", "Members will check your math. Round numbers look made up.", "Not sure about a number? Leave it blank and say why."],
  4: ["Say what you have done before. Track record matters more than anything.", "Name the risks yourself. It builds trust."],
  5: ["A clear photo of the front works best as the cover.", "A rent roll is the first thing serious buyers and lenders ask for."],
  6: ["You can edit or close your deal any time from My deals.", "Share it in the forum to get feedback from experienced members."],
};

const AGREEMENTS = [
  "The numbers are accurate to the best of my knowledge, and I have the right to share this deal.",
  "I understand StorageStack does not check the numbers and members must do their own homework.",
];

function readDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    if (!parsed || !DEAL_TYPE_IDS.includes(parsed.type as DealType)) return null;
    return { ...emptyDraft(), ...parsed };
  } catch {
    return null;
  }
}

function writeDraft(d: Draft | null) {
  try {
    if (d) window.localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    else window.localStorage.removeItem(DRAFT_KEY);
    return true;
  } catch {
    return false;
  }
}

const h2: React.CSSProperties = { margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" };
const lead: React.CSSProperties = { margin: "6px 0 0", color: "#5E6B7E" };
const fieldErr: React.CSSProperties = { display: "block", marginTop: 6, fontSize: 13, fontWeight: 700, color: "#A82A2A" };

function FieldError({ id, msg }: { id: string; msg?: string }) {
  return msg ? (
    <span id={id} role="alert" style={fieldErr}>
      {msg}
    </span>
  ) : null;
}

export function PostDealWizard({ viewer }: { viewer: WizardViewer }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<StepErrors>({});
  const [agree, setAgree] = useState([false, false]);
  const [agreeErr, setAgreeErr] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [posted, setPosted] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const loaded = useRef(false);
  const top = useRef<HTMLDivElement>(null);

  // Restore a saved draft once, after hydration.
  useEffect(() => {
    const d = readDraft();
    if (d) {
      setDraft(d);
      setSaved(true);
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current || posted) return;
    // Nothing worth keeping until the member changes something.
    if (JSON.stringify(draft) === JSON.stringify(emptyDraft())) return;
    setSaved(writeDraft(draft));
  }, [draft, posted]);

  const t = DEAL_TYPES[draft.type];
  const nums = numsOf(draft);
  // Editing a field clears its error; the rest stay until the next Continue.
  const clearError = (keys: string[]) =>
    setErrors((e) => (keys.some((k) => k in e) ? Object.fromEntries(Object.entries(e).filter(([k]) => !keys.includes(k))) : e));
  const update = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    clearError(Object.keys(patch));
  };
  const setNum = (id: string, v: string) => {
    setDraft((d) => ({ ...d, nums: { ...d.nums, [d.type]: { ...(d.nums[d.type] ?? {}), [id]: v } } }));
    clearError([id]);
  };
  const toggleIn = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  function goTo(n: number) {
    setErrors({});
    setAgreeErr(false);
    setStep(n);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function next() {
    const e = validateStep(draft, step);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    if (step < 6) return goTo(step + 1);
    post();
  }

  function post() {
    for (const s of [2, 3]) {
      const e = validateStep(draft, s);
      if (Object.keys(e).length) {
        setStep(s);
        setErrors(e);
        return;
      }
    }
    if (!agree[0] || !agree[1]) {
      setAgreeErr(true);
      return;
    }
    setPostError(null);
    start(async () => {
      const res = await publishDeal(draft);
      if (res.ok && res.id) {
        writeDraft(null);
        setPosted(res.id);
        router.refresh();
        top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (!res.ok && res.needsLogin) {
        router.push("/login?next=/deals/new");
      } else if (!res.ok) {
        setPostError(res.error);
      }
    });
  }

  function startOver() {
    writeDraft(null);
    setDraft(emptyDraft());
    setAgree([false, false]);
    setPosted(null);
    goTo(1);
  }

  const isDone = posted !== null;
  const pct = isDone ? 100 : Math.round((step / 6) * 100);
  const propName = PROPERTY_BY_ID[draft.prop].name;

  const review = [
    { title: "Deal type", icon: t.icon, step: 1, text: `${t.label} · ${propName}${draft.type === "sale" ? (draft.market === "off" ? " · Off-market" : " · Listed") : ""}` },
    { title: "Property", icon: "M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z", step: 2, text: `${draft.title.trim() || "No headline yet"} · ${[draft.city, draft.state.toUpperCase()].filter((x) => x.trim()).join(", ") || "No location yet"}` },
    { title: "Numbers", icon: "M3 3v18h18M7 15l4-4 3 3 5-6", step: 3, text: cardMetrics(draft).map((m) => `${m.l} ${m.v}`).join(" · ") },
    {
      title: "Looking for", icon: "M9 11a4 4 0 100-8 4 4 0 000 8zM2 21v-1a6 6 0 0112 0v1", step: 4,
      text: `${seekText(draft) || "Not set yet"} · ${draft.vis === "approve" ? "Full details only for people you approve" : "Full details for any verified member"}`,
    },
    {
      title: "Photos and files", icon: "M4 7h3l2-3h6l2 3h3v13H4zM12 17a4 4 0 100-8 4 4 0 000 8z", step: 5,
      text: `${draft.photos.length ? `${draft.photos.length} ${draft.photos.length === 1 ? "photo" : "photos"}` : "No photos yet"} · ${Object.keys(draft.docs).length} private document${Object.keys(draft.docs).length === 1 ? "" : "s"}`,
    },
  ];

  return (
    <>
      <div className="wrap" style={{ paddingTop: 22 }} ref={top}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#5E6B7E" }}>
            <Link href="/deals" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#5E6B7E" }}>
              <Icon name="back" size={16} strokeWidth={2.2} />
              Deal Room
            </Link>
            <span aria-hidden="true">/</span>
            <span style={{ color: "#0F1B2D" }}>Post a deal</span>
          </nav>
          {!isDone && (
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
              {saved && (
                <span className="m-hide-sm" role="status" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#5E6B7E" }}>
                  <Icon name="check" size={15} stroke="#16855A" strokeWidth={2.6} />
                  Draft saved
                </span>
              )}
              <Link className="m-btn m-btn-s" href="/deals">
                Save and exit
              </Link>
            </div>
          )}
        </div>
        <h1 style={{ margin: "12px 0 0", fontSize: 36, lineHeight: 1.1, fontWeight: 800, letterSpacing: "-0.03em" }}>Post a deal</h1>
        <p style={{ margin: "8px 0 0", fontSize: 16, color: "#5E6B7E" }}>About 5 minutes. You can save and come back any time.</p>
      </div>

      <div className="wrap" style={{ paddingTop: 24, paddingBottom: 64, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        <aside style={{ flex: "1 1 240px", maxWidth: "100%" }} aria-label="Steps">
          <div className="m-card" style={{ padding: 10 }}>
            {STEPS.map((s, i) => {
              const n = i + 1;
              const done = n < step || isDone;
              const on = n === step && !isDone;
              return (
                <button
                  key={s.title}
                  className={`p-step${on ? " on" : done ? " done" : ""}`}
                  type="button"
                  onClick={() => !isDone && goTo(n)}
                  disabled={isDone}
                  aria-current={on ? "step" : undefined}
                >
                  <span className="p-num">{done ? <Icon name="check" size={15} strokeWidth={3} /> : n}</span>
                  <span style={{ minWidth: 0, lineHeight: 1.3 }}>
                    <b style={{ display: "block", fontSize: 14 }}>{s.title}</b>
                    <span className="p-sub">{s.sub}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <main style={{ flex: "999 1 560px", minWidth: 0 }}>
          <div className="m-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ height: 6, background: "#ECEFF5" }} role="progressbar" aria-label="Progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
              <div style={{ height: "100%", width: `${pct}%`, background: "#DB520B", borderRadius: "0 6px 6px 0", transition: "width .2s" }} />
            </div>
            <div className="p-card" style={{ padding: "32px 36px" }}>
              {isDone && (
                <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
                  <span style={{ width: 76, height: 76, borderRadius: 24, display: "inline-grid", placeItems: "center", background: "#DDF3E8" }}>
                    <Icon name="check" size={38} stroke="#16855A" strokeWidth={2.6} />
                  </span>
                  <h2 style={{ margin: "20px 0 0", fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em" }}>Your deal is live</h2>
                  <p style={{ margin: "10px auto 0", maxWidth: 460, fontSize: 16, lineHeight: 1.6, color: "#4A576B" }}>
                    Members who match what you need will see it first. You will see every request in My deals.
                  </p>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 24 }}>
                    <Link className="m-btn m-btn-o" href={`/deals/${posted}`}>
                      View your deal
                    </Link>
                    <Link className="m-btn m-btn-s" href="/forums/new?cat=acq">
                      Share it in the forum
                    </Link>
                    <button className="m-btn m-btn-g" type="button" onClick={startOver}>
                      Post another deal
                    </button>
                  </div>
                  <div style={{ textAlign: "left", margin: "36px auto 0", maxWidth: 520, background: "#F5F6FA", borderRadius: 18, padding: "20px 22px" }}>
                    <b style={{ display: "block", fontSize: 15 }}>What happens next</b>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12, fontSize: 14, lineHeight: 1.5, color: "#4A576B" }}>
                      <span style={{ display: "flex", gap: 10 }}><b style={{ color: "#DB520B" }}>1</b>Members send requests. You see who they are before you say yes.</span>
                      <span style={{ display: "flex", gap: 10 }}><b style={{ color: "#DB520B" }}>2</b>Approved members get the address and your private documents.</span>
                      <span style={{ display: "flex", gap: 10 }}><b style={{ color: "#DB520B" }}>3</b>Mark the deal as closed when you are done, so it stops showing.</span>
                    </div>
                  </div>
                </div>
              )}

              {!isDone && step === 1 && (
                <>
                  <div className="p-sec">
                    <h2 style={h2}>What are you posting?</h2>
                    <p style={{ ...lead, marginBottom: 18 }}>Pick the one that fits best. It changes the questions we ask next.</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }} role="radiogroup" aria-label="Deal type">
                      {DEAL_TYPE_IDS.map((id) => {
                        const o = DEAL_TYPES[id];
                        const on = id === draft.type;
                        return (
                          <button
                            key={id}
                            className={`d-opt${on ? " on" : ""}`}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            onClick={() => update({ type: id, seek: id === draft.type ? draft.seek : [o.seek] })}
                          >
                            <span className="m-ic" style={{ width: 46, height: 46, borderRadius: 14, background: o.tint }}>
                              <Icon d={o.icon} size={22} stroke={o.dot} />
                            </span>
                            <span style={{ lineHeight: 1.4, minWidth: 0 }}>
                              <b style={{ display: "block", fontSize: 16 }}>{o.label}</b>
                              <span style={{ display: "block", fontSize: 14, color: "#4A576B", marginTop: 2 }}>{o.hint}</span>
                              <span style={{ display: "block", fontSize: 12, color: "#5E6B7E", marginTop: 8 }}>{o.example}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="p-sec">
                    <span className="d-label" id="prop-label">What kind of property?</span>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} role="radiogroup" aria-labelledby="prop-label">
                      {PROPERTY_TYPES.map((p) => (
                        <button key={p.id} className={`d-chip${p.id === draft.prop ? " on" : ""}`} type="button" role="radio" aria-checked={p.id === draft.prop} onClick={() => update({ prop: p.id })}>
                          <Icon d={p.icon} size={17} />
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  {draft.type === "sale" && (
                    <div className="p-sec">
                      <span className="d-label" id="market-label">Is it listed anywhere else?</span>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} role="radiogroup" aria-labelledby="market-label">
                        {([["off", "No, it is off-market"], ["on", "Yes, it is listed"]] as const).map(([id, label]) => (
                          <button key={id} className={`d-chip${draft.market === id ? " on" : ""}`} type="button" role="radio" aria-checked={draft.market === id} onClick={() => update({ market: id })}>
                            {label}
                          </button>
                        ))}
                      </div>
                      <span className="d-help">Off-market deals get a badge and show up first for buyers.</span>
                    </div>
                  )}
                </>
              )}

              {!isDone && step === 2 && (
                <>
                  <div className="p-sec">
                    <h2 style={h2}>The property</h2>
                    <p style={lead}>Where it is and what is there today.</p>
                  </div>
                  <div className="p-sec" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div>
                      <label className="d-label" htmlFor="pHead">Headline</label>
                      <input
                        id="pHead" className="d-input" type="text" value={draft.title} maxLength={140} style={{ fontWeight: 700 }}
                        placeholder={draft.type === "sale" ? "e.g. Owner retiring: 38,000 sq ft facility with rents under market" : "e.g. Value-add: 52,000 sq ft climate-controlled facility in Huntsville"}
                        aria-invalid={!!errors.title} aria-describedby={errors.title ? "pHead-err" : "pHead-help"}
                        onChange={(e) => update({ title: e.target.value })}
                      />
                      <FieldError id="pHead-err" msg={errors.title} />
                      <span className="d-help" id="pHead-help">
                        Lead with what makes it interesting. &ldquo;Owner retiring&rdquo; or &ldquo;rents under market&rdquo; works better than the address.
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                      <div>
                        <label className="d-label" htmlFor="pCity">City</label>
                        <input id="pCity" className="d-input" type="text" value={draft.city} autoComplete="address-level2" aria-invalid={!!errors.city} onChange={(e) => update({ city: e.target.value })} />
                        <FieldError id="pCity-err" msg={errors.city} />
                      </div>
                      <div>
                        <label className="d-label" htmlFor="pState">State</label>
                        <input id="pState" className="d-input" type="text" value={draft.state} maxLength={30} placeholder="e.g. OH" autoComplete="address-level1" aria-invalid={!!errors.state} onChange={(e) => update({ state: e.target.value })} />
                        <FieldError id="pState-err" msg={errors.state} />
                      </div>
                      <div>
                        <label className="d-label" htmlFor="pRegion">Region</label>
                        <select id="pRegion" className="d-input" value={draft.region} onChange={(e) => update({ region: e.target.value })}>
                          <option value="">Choose a region</option>
                          {REGIONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="d-label" htmlFor="pAddr">Street address</label>
                      <input id="pAddr" className="d-input" type="text" value={draft.address} placeholder="1200 Example Rd" autoComplete="street-address" aria-describedby="pAddr-help" onChange={(e) => update({ address: e.target.value })} />
                      <span className="d-help" id="pAddr-help" style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <Icon name="lock" size={14} strokeWidth={2.4} />
                        Private. Only people you approve will see it. Everyone else sees the city.
                      </span>
                    </div>
                  </div>
                  <div className="p-sec">
                    <span className="d-label">Size</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14 }}>
                      {sizeFields(draft.type).map((f) => (
                        <div key={f.id}>
                          <label className="d-label" style={{ fontSize: 13, fontWeight: 700, color: "#4A576B" }} htmlFor={`pSize-${f.id}`}>{f.label}</label>
                          <div className="p-adorn">
                            <input id={`pSize-${f.id}`} type="text" inputMode={f.id === "year" ? "text" : "decimal"} placeholder={f.placeholder} value={draft.size[f.id] ?? ""} onChange={(e) => update({ size: { ...draft.size, [f.id]: e.target.value } })} />
                            <span>{f.suf}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-sec">
                    <span className="d-label">What does it have?</span>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {FEATURES.map((f) => {
                        const on = draft.features.includes(f.id);
                        return (
                          <button key={f.id} className={`d-chip${on ? " on" : ""}`} type="button" aria-pressed={on} onClick={() => update({ features: toggleIn(draft.features, f.id) })}>
                            {on && <Icon name="check" size={15} strokeWidth={3} />}
                            {f.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {!isDone && step === 3 && (
                <>
                  <div className="p-sec">
                    <h2 style={h2}>The numbers</h2>
                    <p style={lead}>{NUMBERS_SUB[draft.type]}</p>
                  </div>
                  <div className="p-sec">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 18 }}>
                      {NUM_FIELDS[draft.type].map((f) => (
                        <div key={f.id}>
                          <label className="d-label" htmlFor={`pNum-${f.id}`}>{f.label}</label>
                          <div className="p-adorn" style={errors[f.id] ? { borderColor: "#A82A2A" } : undefined}>
                            {f.pre && <span>{f.pre}</span>}
                            <input
                              id={`pNum-${f.id}`} type="text" inputMode={f.text ? "text" : "decimal"} placeholder={f.placeholder} value={nums[f.id] ?? ""}
                              aria-invalid={!!errors[f.id]} aria-describedby={f.hint ? `pNum-${f.id}-hint` : undefined}
                              onChange={(e) => setNum(f.id, e.target.value)}
                            />
                            {f.suf && <span>{f.suf}</span>}
                          </div>
                          <FieldError id={`pNum-${f.id}-err`} msg={errors[f.id]} />
                          {f.hint && <span className="d-help" id={`pNum-${f.id}-hint`}>{f.hint}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-sec">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                      <span className="d-label" style={{ margin: 0 }}>We worked these out for you</span>
                      <Link href="/tools" style={{ fontSize: 14, fontWeight: 700, color: "#DB520B" }}>Open the full calculator</Link>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }} aria-live="polite">
                      {calcs(draft).map((c) => (
                        <div key={c.l} className="p-calc">
                          <span>{c.l}</span>
                          <b>{c.v}</b>
                          <span style={{ fontWeight: 600, marginTop: 4, color: "#5E8A73" }}>{c.h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {!isDone && step === 4 && (
                <>
                  <div className="p-sec">
                    <h2 style={h2}>What you need</h2>
                    <p style={lead}>We will show your deal first to members who match.</p>
                  </div>
                  <div className="p-sec">
                    <span className="d-label">Who are you looking for?</span>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {SEEK_OPTIONS.map((o) => {
                        const on = draft.seek.includes(o.id);
                        return (
                          <button key={o.id} className={`d-chip${on ? " on" : ""}`} type="button" aria-pressed={on} onClick={() => update({ seek: toggleIn(draft.seek, o.id) })}>
                            {on && <Icon name="check" size={15} strokeWidth={3} />}
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                    <span className="d-help">Pick as many as you like.</span>
                  </div>
                  <div className="p-sec">
                    <label className="d-label" htmlFor="pDesc">Tell the story</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }} aria-hidden="true">
                      {["Why is it a good deal?", "What is your plan?", "What is your experience?", "What are the risks?"].map((h) => (
                        <span key={h} className="p-hint-chip">{h}</span>
                      ))}
                    </div>
                    <textarea
                      id="pDesc" className="d-input" value={draft.story} maxLength={6000}
                      placeholder="Why is it a good deal, what is your plan, what have you done before and what could go wrong?"
                      onChange={(e) => update({ story: e.target.value })}
                    />
                  </div>
                  <div className="p-sec">
                    <label className="d-label" htmlFor="pWhen">When do you need it by?</label>
                    <select id="pWhen" className="d-input" style={{ maxWidth: 320, fontWeight: 700 }} value={draft.neededBy} onChange={(e) => update({ neededBy: e.target.value })}>
                      {NEEDED_BY.map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div className="p-sec">
                    <span className="d-label" id="vis-label">Who can see the full details?</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }} role="radiogroup" aria-labelledby="vis-label">
                      {([
                        ["approve", "Only people I approve", "They send a request, you see their profile, then you decide.", true],
                        ["verified", "Any verified member", "Faster, but more people see your address and files.", false],
                      ] as const).map(([id, label, hint, rec]) => {
                        const on = draft.vis === id;
                        return (
                          <button key={id} className={`d-opt${on ? " on" : ""}`} type="button" role="radio" aria-checked={on} onClick={() => update({ vis: id })}>
                            <span style={{ width: 22, height: 22, borderRadius: "50%", flex: "none", marginTop: 1, border: `2px solid ${on ? "#DB520B" : "#C9D1DE"}`, display: "grid", placeItems: "center" }}>
                              <span style={{ width: 10, height: 10, borderRadius: "50%", background: on ? "#DB520B" : "transparent" }} />
                            </span>
                            <span style={{ lineHeight: 1.4 }}>
                              <b style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 15, flexWrap: "wrap" }}>
                                {label}
                                {rec && <span style={{ fontSize: 11, fontWeight: 800, color: "#17603F", background: "#DDF3E8", padding: "2px 8px", borderRadius: 999 }}>Recommended</span>}
                              </b>
                              <span style={{ display: "block", fontSize: 13, color: "#5E6B7E", marginTop: 3 }}>{hint}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {!isDone && step === 5 && (
                <>
                  <div className="p-sec">
                    <h2 style={h2}>Photos and documents</h2>
                    <p style={lead}>Photos are public. Documents stay private until you approve someone.</p>
                  </div>
                  <div className="p-sec">
                    <span className="d-label">Photos</span>
                    <PhotoUploads draft={draft} userId={viewer.id} update={update} />
                  </div>
                  <div className="p-sec">
                    <span className="d-label">Documents</span>
                    <span className="d-help" style={{ margin: "-4px 0 8px" }}>Deals with a rent roll and real income numbers get far more serious requests.</span>
                    <DocumentUploads draft={draft} userId={viewer.id} update={update} />
                  </div>
                </>
              )}

              {!isDone && step === 6 && (
                <>
                  <div className="p-sec">
                    <h2 style={h2}>Check and post</h2>
                    <p style={lead}>This is what members will see. You can edit it after posting too.</p>
                  </div>
                  <div className="p-sec">
                    {review.map((r) => (
                      <div key={r.title} className="p-rev">
                        <span className="m-ic" style={{ width: 40, height: 40, borderRadius: 12, background: "#F3F5F9" }}>
                          <Icon d={r.icon} size={18} stroke="#0B1F3A" />
                        </span>
                        <span style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>
                          <b style={{ display: "block", fontSize: 15 }}>{r.title}</b>
                          <span style={{ fontSize: 14, color: "#4A576B", overflowWrap: "anywhere" }}>{r.text}</span>
                        </span>
                        <button className="p-edit" type="button" onClick={() => goTo(r.step)} aria-label={`Edit ${r.title.toLowerCase()}`}>Edit</button>
                      </div>
                    ))}
                  </div>
                  <div className="p-sec" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {AGREEMENTS.map((text, i) => (
                      <button
                        key={i}
                        className="p-check"
                        type="button"
                        role="checkbox"
                        aria-checked={agree[i]}
                        onClick={() => {
                          setAgree((a) => a.map((v, j) => (j === i ? !v : v)));
                          setAgreeErr(false);
                        }}
                      >
                        <span className="p-box">{agree[i] && <Icon name="check" size={13} strokeWidth={3.4} />}</span>
                        <span>{text}</span>
                      </button>
                    ))}
                    {agreeErr && (
                      <span role="alert" style={{ fontSize: 14, fontWeight: 700, color: "#A82A2A" }}>Please tick both boxes to post your deal.</span>
                    )}
                    {postError && (
                      <div className="m-alert err" role="alert">{postError}</div>
                    )}
                  </div>
                </>
              )}
            </div>

            {!isDone && (
              <div style={{ padding: "18px 36px", borderTop: "1px solid #EEF1F5", background: "#FAFBFD", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {step > 1 && (
                  <button className="m-btn m-btn-g" type="button" onClick={() => goTo(step - 1)}>
                    <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
                    Back
                  </button>
                )}
                <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700, color: "#5E6B7E" }}>Step {step} of 6</span>
                <button className="m-btn m-btn-o" type="button" onClick={next} disabled={pending} style={{ minWidth: 160 }}>
                  {pending ? "Posting…" : step === 6 ? "Post deal" : "Continue"}
                  {!pending && <Icon name="arrowRight" size={16} strokeWidth={2.4} />}
                </button>
              </div>
            )}
          </div>
        </main>

        <aside style={{ flex: "1 1 330px", maxWidth: "100%", display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 96 }} aria-label="Preview and tips">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 4px", gap: 8, flexWrap: "wrap" }}>
            <b style={{ fontSize: 15 }}>Preview</b>
            <span style={{ fontSize: 13, color: "#5E6B7E" }}>How it shows in the Deal Room</span>
          </div>
          <Preview draft={draft} viewer={viewer} />
          {!isDone && (
            <div className="m-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span className="m-ic" style={{ background: "#FFEDE2" }}>
                  <Icon name="bulb" size={17} stroke="#DB520B" />
                </span>
                <b style={{ fontSize: 15 }}>Tips for step {step}</b>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
                {TIPS[step].map((tip) => (
                  <span key={tip} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.5, color: "#4A576B" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#DB520B", marginTop: 8, flex: "none" }} />
                    {tip}
                  </span>
                ))}
              </div>
            </div>
          )}
          <Link href="/guidelines" style={{ fontSize: 13, color: "#5E6B7E", padding: "0 4px" }}>Deal Room rules</Link>
        </aside>
      </div>
    </>
  );
}
