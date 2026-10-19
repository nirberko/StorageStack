"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { deleteMember, setMemberSuspended, updateMember } from "@/app/actions/admin";
import type { ActionResult } from "@/app/actions/shared";
import { Icon } from "@/components/Icon";
import type { IconName } from "@/lib/icons";

type Member = { id: string; name: string; verified: boolean; moderator: boolean; admin: boolean; suspended: boolean };

type Item = { label: string; icon: IconName; danger?: boolean; confirm?: string; run: () => Promise<ActionResult> };

export function MemberActions({ member: m, self }: { member: Member; self: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items: Item[] = [
    m.verified
      ? { label: "Remove verification", icon: "shield", run: () => updateMember(m.id, { verified: false }) }
      : { label: "Verify member", icon: "shieldCheck", run: () => updateMember(m.id, { verified: true }) },
    m.moderator
      ? { label: "Remove moderator", icon: "flag", run: () => updateMember(m.id, { is_moderator: false }) }
      : { label: "Make moderator", icon: "flag", run: () => updateMember(m.id, { is_moderator: true }) },
  ];
  if (!self) {
    items.push(
      m.admin
        ? {
            label: "Remove admin",
            icon: "lock",
            confirm: `Remove admin access from ${m.name}?`,
            run: () => updateMember(m.id, { is_admin: false }),
          }
        : {
            label: "Make admin",
            icon: "lock",
            confirm: `Make ${m.name} an admin? Admins can manage every member and topic, including you.`,
            run: () => updateMember(m.id, { is_admin: true }),
          },
    );
  }
  // Admins have to be demoted first, so one admin cannot lock out or delete another by accident.
  if (!self && !m.admin) {
    items.push(
      m.suspended
        ? { label: "Restore access", icon: "check", run: () => setMemberSuspended(m.id, false) }
        : {
            label: "Suspend",
            icon: "x",
            danger: true,
            confirm: `Suspend ${m.name}? They are logged out and cannot log in until you restore access.`,
            run: () => setMemberSuspended(m.id, true),
          },
      {
        label: "Delete member",
        icon: "trash",
        danger: true,
        confirm: `Delete ${m.name}? Their account, discussions, replies and deals are removed. This cannot be undone.`,
        run: () => deleteMember(m.id),
      },
    );
  }

  function choose(item: Item) {
    setOpen(false);
    if (item.confirm && !confirm(item.confirm)) return;
    start(async () => {
      const res = await item.run();
      if (res.ok) {
        setError(null);
        router.refresh();
      } else setError(res.error);
    });
  }

  const row: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 10, minHeight: 42, padding: "0 12px", borderRadius: 10,
    fontWeight: 600, fontSize: 14, width: "100%", border: 0, background: "transparent", textAlign: "left",
  };

  return (
    <div ref={ref} style={{ position: "relative", marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
      {error && (
        <span role="alert" style={{ fontSize: 13, fontWeight: 700, color: "#A82A2A", maxWidth: 220 }}>
          {error}
        </span>
      )}
      <button
        className="m-btn m-btn-line"
        type="button"
        aria-expanded={open}
        aria-label={`Manage ${m.name}`}
        disabled={pending}
        onClick={() => setOpen((o) => !o)}
        style={{ minHeight: 40, padding: "0 14px", fontSize: 14 }}
      >
        {pending ? "Saving…" : "Manage"}
        <Icon d="M6 9l6 6 6-6" size={15} />
      </button>
      {open && (
        <div
          className="m-card"
          style={{ position: "absolute", right: 0, top: 48, width: 230, padding: 6, zIndex: 30, boxShadow: "0 14px 40px rgba(11,31,58,0.12)" }}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              className="a-menu-item"
              onClick={() => choose(item)}
              style={{ ...row, color: item.danger ? "#A82A2A" : "#1E2B3F" }}
            >
              <Icon name={item.icon} />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
