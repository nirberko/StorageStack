"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import type { ProfileStep } from "@/lib/profileProgress";

export function ShareProfileButton({ profileId, name }: { profileId: string; name: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/u/${profileId}`;
    try {
      if (navigator.share) await navigator.share({ url, title: `${name} on StorageStack` });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // The member closed the share sheet, or the clipboard is blocked.
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button type="button" className="m-btn m-btn-line" onClick={share} style={{ flex: 1 }}>
        <Icon name="share" size={17} />
        Share my profile
      </button>
      <span role="status" aria-live="polite" style={{ fontSize: 13, fontWeight: 700, color: "#17603F" }}>
        {copied ? "Link copied" : ""}
      </span>
    </div>
  );
}

/** The profile checklist. Open by default while steps are left. */
export function NextUp({ steps, left }: { steps: ProfileStep[]; left: number }) {
  const [open, setOpen] = useState(left > 0);

  return (
    <div>
      <button type="button" className="h-toggle" aria-expanded={open} aria-controls="next-up" onClick={() => setOpen(!open)}>
        <span className="h-eyebrow">{left > 0 ? `Next up · ${left} left` : "All steps done"}</span>
        <Icon name="chevron" size={18} style={{ transform: open ? "rotate(-90deg)" : "rotate(90deg)", transition: "transform 0.15s" }} />
      </button>
      {open && (
        <ul id="next-up" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {steps.map((s) => {
            const body = (
              <>
                <span className="h-check">
                  <Icon name="check" size={14} strokeWidth={3} />
                </span>
                <span className="h-st" style={{ flex: 1, minWidth: 0 }}>
                  {s.label}
                  {s.done && <span className="sr-only"> (done)</span>}
                </span>
                {!s.done && <span className="h-pts">+{s.points} pts</span>}
              </>
            );
            return (
              <li key={s.id}>
                {s.done ? (
                  <div className="h-step done">{body}</div>
                ) : (
                  <Link className="h-step" href={s.href}>
                    {body}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
