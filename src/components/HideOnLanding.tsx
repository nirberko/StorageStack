"use client";

import { usePathname } from "next/navigation";

/** Hides the site header or footer on the landing page, which brings its own. */
export function HideOnLanding({ active, children }: { active: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  if (active && pathname === "/") return null;
  return <>{children}</>;
}
