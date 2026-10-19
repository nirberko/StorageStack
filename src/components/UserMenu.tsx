"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { signOut } from "@/app/actions/auth";

export function UserMenu({ id, name, color }: { id: string; name: string; color: string }) {
  const [open, setOpen] = useState(false);
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

  const item: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 10, minHeight: 42, padding: "0 12px", borderRadius: 10,
    fontWeight: 600, fontSize: 14, color: "#1E2B3F", width: "100%", border: 0, background: "transparent", textAlign: "left",
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        aria-label="Your account"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{ border: 0, background: "transparent", padding: 0, display: "flex" }}
      >
        <Avatar name={name} color={color} size={40} radius={13} fontSize={13} />
      </button>
      {open && (
        <div
          className="m-card"
          style={{ position: "absolute", right: 0, top: 50, width: 240, padding: 8, zIndex: 30, boxShadow: "0 14px 40px rgba(11,31,58,0.12)" }}
        >
          <div style={{ padding: "8px 12px 10px", borderBottom: "1px solid #EEF1F5", marginBottom: 6 }}>
            <b style={{ display: "block", fontSize: 14 }}>{name}</b>
          </div>
          <Link href={`/u/${id}`} style={item} onClick={() => setOpen(false)}>
            <Icon name="user" /> Your profile
          </Link>
          <Link href="/deals/mine" style={item} onClick={() => setOpen(false)}>
            <Icon name="briefcase" /> My deals and requests
          </Link>
          <Link href="/settings" style={item} onClick={() => setOpen(false)}>
            <Icon name="shield" /> Settings
          </Link>
          <form action={signOut}>
            <button type="submit" style={item}>
              <Icon name="logout" /> Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
