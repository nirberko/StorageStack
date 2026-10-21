"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";
import type { IconName } from "@/lib/icons";

const LINKS: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/forums", label: "Forums", icon: "chat" },
  { href: "/deals", label: "Deal Room", icon: "briefcase" },
  { href: "/tools", label: "Tools", icon: "calculator" },
  { href: "/learn", label: "Learn", icon: "bulb" },
];

/** The main links. The icon and chevron only show in the phone menu, where each link is a full-width row. */
export function NavLinks() {
  const path = usePathname();
  return (
    <nav className="m-nav" aria-label="Main">
      {LINKS.map((l) => {
        const on = l.href === "/" ? path === "/" : path === l.href || path.startsWith(l.href + "/");
        return (
          <Link key={l.href} href={l.href} className={on ? "on" : undefined} aria-current={on ? "page" : undefined}>
            <span className="m-nav-ic">
              <Icon name={l.icon} size={19} />
            </span>
            {l.label}
            <Icon name="chevron" size={18} className="m-nav-go" />
          </Link>
        );
      })}
    </nav>
  );
}
