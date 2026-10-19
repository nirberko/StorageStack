"use client";

import { useActionState, useEffect, useRef } from "react";
import { createAlert, type FormState } from "@/app/actions/deal-page";
import { DEAL_TYPE_IDS, DEAL_TYPES, PROPERTY_TYPES, REGIONS } from "@/lib/config";

export function AlertForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createAlert, {});
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {state.error && (
        <div className="m-alert err" role="alert">
          {state.error}
        </div>
      )}
      {state.ok && (
        <div className="m-alert ok" role="status">
          Alert saved.
        </div>
      )}
      <div>
        <label className="d-label" htmlFor="aType">
          Deal type
        </label>
        <select id="aType" name="deal_type" className="d-input" defaultValue="">
          <option value="">Any deal type</option>
          {DEAL_TYPE_IDS.map((id) => (
            <option key={id} value={id}>
              {DEAL_TYPES[id].name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="d-label" htmlFor="aProp">
          Property type
        </label>
        <select id="aProp" name="property_type" className="d-input" defaultValue="">
          <option value="">Any property</option>
          {PROPERTY_TYPES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="d-label" htmlFor="aRegion">
          Location
        </label>
        <select id="aRegion" name="region" className="d-input" defaultValue="">
          <option value="">Anywhere in the US</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="d-label" htmlFor="aMax">
          Up to
        </label>
        <div className="p-adorn">
          <span>$</span>
          <input id="aMax" name="max_amount" inputMode="numeric" placeholder="3,000,000" />
        </div>
        <span className="d-help">Leave empty for any size.</span>
      </div>
      <div>
        <label className="d-label" htmlFor="aLabel">
          Name <span style={{ fontWeight: 600, color: "#5E6B7E" }}>(optional)</span>
        </label>
        <input id="aLabel" name="label" className="d-input" maxLength={60} placeholder="e.g. Value-add in Ohio" />
      </div>
      <button className="m-btn m-btn-o" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save alert"}
      </button>
    </form>
  );
}
