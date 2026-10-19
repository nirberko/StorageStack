"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";
import type { IconName } from "@/lib/icons";

const LINKS: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin/members", label: "Members", icon: "people" },
  { href: "/admin/topics", label: "Forum topics", icon: "chat" },
];

export function AdminNav({ counts }: { counts: Record<string, number> }) {
  const path = usePathname();
  return (
    <nav className="m-card" aria-label="Admin" style={{ padding: 8 }}>
      {LINKS.map((l) => {
        const on = path === l.href || path.startsWith(l.href + "/");
        return (
          <Link key={l.href} className={`m-side${on ? " on" : ""}`} href={l.href} aria-current={on ? "page" : undefined}>
            <span className="m-ic" style={{ background: "#EEF2F8" }}>
              <Icon name={l.icon} size={17} />
            </span>
            {l.label}
            <span className="m-n">{counts[l.href] ?? ""}</span>
          </Link>
        );
      })}
    </nav>
  );
}
