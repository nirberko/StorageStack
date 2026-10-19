"use client";

import { useEffect, useState } from "react";

export function JumpNav({ items }: { items: { id: string; label: string; count?: number }[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -55% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav className="x-jump" aria-label="On this page" style={{ position: "sticky", top: 84, zIndex: 5, boxShadow: "0 6px 18px rgba(11,31,58,0.05)" }}>
      {items.map((i) => (
        <a key={i.id} className={i.id === active ? "on" : undefined} href={`#${i.id}`} aria-current={i.id === active ? "true" : undefined}>
          {i.label}
          {i.count ? (
            <>
              {" "}
              <span style={{ fontWeight: 800, color: i.id === active ? "#FFB98E" : "#DB520B" }}>{i.count}</span>
            </>
          ) : null}
        </a>
      ))}
    </nav>
  );
}
