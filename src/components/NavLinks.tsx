"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/forums", label: "Forums" },
  { href: "/deals", label: "Deal Room" },
  { href: "/tools", label: "Tools" },
  { href: "/learn", label: "Learn" },
];

export function NavLinks() {
  const path = usePathname();
  return (
    <nav className="m-nav" aria-label="Main">
      {LINKS.map((l) => {
        const on = l.href === "/" ? path === "/" : path === l.href || path.startsWith(l.href + "/");
        return (
          <Link key={l.href} href={l.href} className={on ? "on" : undefined} aria-current={on ? "page" : undefined}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
