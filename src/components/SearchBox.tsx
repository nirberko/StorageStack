"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/Icon";

export function SearchBox() {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ref.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <form
      role="search"
      className="m-search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = ref.current?.value.trim() ?? "";
        router.push(`/search?q=${encodeURIComponent(q)}`);
      }}
    >
      <Icon name="search" size={17} stroke="#5E6B7E" />
      <label htmlFor="site-search" className="sr-only">
        Search the forums
      </label>
      <input
        id="site-search"
        ref={ref}
        type="search"
        name="q"
        defaultValue={path === "/search" ? params.get("q") ?? "" : ""}
        placeholder="Search discussions, markets, people"
      />
      <span className="m-kbd m-hide-sm">⌘K</span>
    </form>
  );
}
