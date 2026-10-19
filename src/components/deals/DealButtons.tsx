"use client";

import { toggleDealRequest, toggleDealSave, togglePartnerConnect } from "@/app/actions/deals";
import { Icon } from "@/components/Icon";
import { useToggle } from "@/lib/useToggle";

export function DealSaveButton({ dealId, saved, className = "d-save" }: { dealId: number; saved: boolean; className?: string }) {
  const t = useToggle(saved, (on) => toggleDealSave(dealId, on));
  return (
    <button
      className={`${className}${t.on ? " on" : ""}`}
      type="button"
      onClick={t.toggle}
      aria-pressed={t.on}
      aria-label={t.on ? "Remove from saved" : "Save deal"}
    >
      <Icon name="bookmark" size={18} fill={t.on ? "currentColor" : "none"} />
    </button>
  );
}

export function DealRequestButton({ dealId, requested, label, own }: { dealId: number; requested: boolean; label: string; own?: boolean }) {
  const t = useToggle(requested, (on) => toggleDealRequest(dealId, on));
  if (own) {
    return (
      <a className="d-req" href="/deals/mine">
        Your deal
      </a>
    );
  }
  return (
    <button className={`d-req${t.on ? " on" : ""}`} type="button" onClick={t.toggle} aria-pressed={t.on} title={t.error ?? undefined}>
      {t.on && <Icon name="check" size={14} strokeWidth={3} />}
      {t.on ? "Request sent" : label}
    </button>
  );
}

export function ConnectButton({ partnerId, connected, own }: { partnerId: string; connected: boolean; own?: boolean }) {
  const t = useToggle(connected, (on) => togglePartnerConnect(partnerId, on));
  if (own) return <span className="d-req on">That&apos;s you</span>;
  return (
    <button className={`d-req${t.on ? " on" : ""}`} type="button" onClick={t.toggle} aria-pressed={t.on}>
      {t.on && <Icon name="check" size={14} strokeWidth={3} />}
      {t.on ? "Request sent" : "Connect"}
    </button>
  );
}
