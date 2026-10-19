"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { getDocumentUrl } from "@/app/actions/deal-page";
import { Icon } from "@/components/Icon";
import { useDeal } from "@/components/deals/page/DealContext";

export type DocAccess = "own" | "open" | "pending" | "declined" | "none";

export function DocsSubtitle({ access, firstName }: { access: DocAccess; firstName: string }) {
  const d = useDeal();
  const text =
    access === "own"
      ? "Members see these once you approve their request."
      : access === "open"
        ? "You have access to these files."
        : access === "declined"
          ? `${firstName} did not approve access this time.`
          : d.requested
            ? `Request sent. ${firstName} usually replies within a day.`
            : `Shared privately after ${firstName} approves your request.`;
  return <p className="x-sub">{text}</p>;
}

export function DocsButton({ access }: { access: DocAccess }) {
  const d = useDeal();
  if (access === "own") {
    return (
      <Link className="m-btn m-btn-s" href="/deals/mine">
        Manage requests
      </Link>
    );
  }
  if (access === "open" || access === "declined") return null;
  return (
    <button className={`m-btn ${d.requested ? "done" : "m-btn-o"}`} type="button" onClick={d.toggleRequest} aria-pressed={d.requested}>
      {d.requested ? "Request sent" : "Request access"}
    </button>
  );
}

const STATES = {
  locked: { label: "Locked", color: "#5E6B7E", icon: "lock" as const },
  requested: { label: "Requested", color: "#8A5A12", icon: "clock" as const },
  shared: { label: "Ask for this file", color: "#5E6B7E", icon: "clock" as const },
};

export function DocState({ access, documentId, hasFile }: { access: DocAccess; documentId: number; hasFile: boolean }) {
  const d = useDeal();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if ((access === "open" || access === "own") && hasFile) {
    return (
      <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end" }}>
        <button
          type="button"
          className="x-like"
          style={{ color: "#17603F" }}
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await getDocumentUrl(documentId);
              if (res.url) window.open(res.url, "_blank", "noopener");
              else setError(res.error ?? "Could not open the file.");
            })
          }
        >
          <Icon name="file" size={15} strokeWidth={2.2} />
          {pending ? "Opening…" : "Download"}
        </button>
        {error && <span style={{ fontSize: 12, color: "#A82A2A", fontWeight: 600 }}>{error}</span>}
      </span>
    );
  }
  const s = access === "open" || access === "own" ? STATES.shared : d.requested && access !== "declined" ? STATES.requested : STATES.locked;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: s.color, whiteSpace: "nowrap" }}>
      <Icon name={s.icon} size={15} strokeWidth={2.2} />
      {s.label}
    </span>
  );
}
