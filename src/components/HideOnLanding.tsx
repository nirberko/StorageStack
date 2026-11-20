"use client";

import { usePathname } from "next/navigation";

/** Pages that bring their own frame: the sign-in pages show only the logo, so the site header and footer step aside. */
const AUTH_PAGES = ["/login", "/signup", "/forgot-password", "/reset-password"];

/** Hides the site header or footer on the landing page (for visitors) and on the sign-in pages (for everyone). */
export function HideOnLanding({ active, children }: { active: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  if (AUTH_PAGES.includes(pathname)) return null;
  if (active && pathname === "/") return null;
  return <>{children}</>;
}
