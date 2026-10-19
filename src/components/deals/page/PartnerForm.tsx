"use client";

import { useActionState } from "react";
import { savePartnerProfile, type FormState } from "@/app/actions/deal-page";
import { PARTNER_KINDS } from "@/lib/config";
import type { CapitalPartner } from "@/lib/types";

export function PartnerForm({ current }: { current: CapitalPartner | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(savePartnerProfile, {});

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {state.error && (
        <div className="m-alert err" role="alert">
          {state.error}
        </div>
      )}
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="d-label">What kind of partner are you?</legend>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
          {Object.entries(PARTNER_KINDS).map(([kind, c]) => (
            <label key={kind} className="d-chip" style={{ cursor: "pointer", justifyContent: "flex-start" }}>
              <input type="radio" name="kind" value={kind} defaultChecked={(current?.kind ?? "Investor") === kind} style={{ accentColor: "#DB520B", width: 18, height: 18 }} />
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.ink }} />
              {kind}
            </label>
          ))}
        </div>
      </fieldset>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
        <div>
          <label className="d-label" htmlFor="pOfferLabel">
            You…
          </label>
          <select id="pOfferLabel" name="offer_label" className="d-input" defaultValue={current?.offer_label ?? "Invests"}>
            <option value="Invests">Invest</option>
            <option value="Lends">Lend</option>
            <option value="Brings">Bring</option>
          </select>
        </div>
        <div>
          <label className="d-label" htmlFor="pOffer">
            How much or what
          </label>
          <input id="pOffer" name="offer" className="d-input" required defaultValue={current?.offer ?? ""} placeholder="$100k – $500k" maxLength={60} />
        </div>
      </div>
      <div>
        <label className="d-label" htmlFor="pAbout">
          What you are looking for
        </label>
        <textarea
          id="pAbout"
          name="about"
          className="d-input"
          style={{ minHeight: 110 }}
          defaultValue={current?.about ?? ""}
          maxLength={400}
          placeholder="e.g. Moving from apartments into storage. Likes facilities 70–85% full with room to raise rents."
        />
      </div>
      <div>
        <label className="d-label" htmlFor="pFocus">
          Focus
        </label>
        <input id="pFocus" name="focus" className="d-input" defaultValue={current?.focus.join(", ") ?? ""} placeholder="Value-add, Sun Belt, Passive" />
        <span className="d-help">Up to 5, separated by commas. Shown as tags on your card.</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
        <div>
          <label className="d-label" htmlFor="pTrack">
            Track record
          </label>
          <input id="pTrack" name="track_record" className="d-input" defaultValue={current?.track_record ?? ""} placeholder="7 deals funded" maxLength={60} />
        </div>
        <div>
          <label className="d-label" htmlFor="pReply">
            How fast you reply
          </label>
          <select id="pReply" name="reply_time" className="d-input" defaultValue={current?.reply_time ?? "Usually replies within a day"}>
            <option>Usually replies within hours</option>
            <option>Usually replies within a day</option>
            <option>Usually replies within 3 days</option>
          </select>
        </div>
      </div>
      <button className="m-btn m-btn-o" type="submit" disabled={pending} style={{ minHeight: 50, fontSize: 16 }}>
        {pending ? "Saving…" : current ? "Save changes" : "Join as a capital partner"}
      </button>
    </form>
  );
}
