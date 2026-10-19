"use client";

import { useState } from "react";
import { reportDeal } from "@/app/actions/deal-page";
import { Icon } from "@/components/Icon";
import { DealSaveButton } from "@/components/deals/DealButtons";
import { useToggle } from "@/lib/useToggle";

export function HeaderActions({ dealId, saved, reported, own }: { dealId: number; saved: boolean; reported: boolean; own: boolean }) {
  const [copied, setCopied] = useState(false);
  const report = useToggle(reported, (on) => reportDeal(dealId, on));

  async function share() {
    const url = window.location.href.split("#")[0];
    try {
      if (navigator.share) await navigator.share({ url, title: document.title });
      else await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // The member closed the share sheet.
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <span role="status" aria-live="polite" style={{ fontSize: 13, fontWeight: 700, color: "#17603F" }}>
        {copied ? "Link copied" : report.on ? "Reported to moderators" : ""}
      </span>
      <DealSaveButton dealId={dealId} saved={saved} className="x-icon-btn" />
      <button className="x-icon-btn" type="button" aria-label="Share deal" onClick={share}>
        <Icon name="share" size={18} />
      </button>
      {!own && (
        <button
          className={`x-icon-btn${report.on ? " on" : ""}`}
          type="button"
          aria-label={report.on ? "Withdraw report" : "Report deal"}
          aria-pressed={report.on}
          onClick={report.toggle}
        >
          <Icon name="flag" size={18} />
        </button>
      )}
    </div>
  );
}
