"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";

/**
 * Sticky site header. On phones the nav and search fold into a menu sheet that drops down over
 * the page, so the header stays one compact row and remains reachable however far down you are.
 */
export function HeaderShell({ logo, menu, account }: { logo: React.ReactNode; menu: React.ReactNode; account: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const ref = useRef<HTMLElement>(null);

  // Close after navigating.
  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onDown(e: MouseEvent | TouchEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    // The menu only exists on phones; close it if the window grows past that.
    const wide = window.matchMedia("(min-width: 761px)");
    function onWide() {
      if (wide.matches) setOpen(false);
    }
    // The open menu covers the page, so the page underneath should not scroll.
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    wide.addEventListener("change", onWide);
    return () => {
      root.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <header ref={ref} className={`m-header${open ? " open" : ""}`}>
      <div className="wrap m-header-in">
        {logo}
        <div
          id="site-menu"
          className="m-menu-panel"
          onClick={(e) => (e.target as Element).closest("a") && setOpen(false)}
          onSubmit={() => setOpen(false)}
        >
          {menu}
        </div>
        <div className="m-account">{account}</div>
        <button
          type="button"
          className="m-menu-btn"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <Icon d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} size={22} strokeWidth={2.2} />
        </button>
      </div>
      {open && <div className="m-menu-scrim" aria-hidden="true" onClick={() => setOpen(false)} />}
    </header>
  );
}
