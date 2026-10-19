"use client";

import { useOptimistic, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ActionResult } from "@/app/actions/shared";

/**
 * Optimistic on/off state backed by a server action. Visitors who are not signed in
 * are sent to the login page and brought back here afterwards.
 */
export function useToggle(initial: boolean, action: (on: boolean) => Promise<ActionResult>) {
  const router = useRouter();
  const path = usePathname();
  const [value, setValue] = useState(initial);
  const [optimistic, setOptimistic] = useOptimistic(value);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    const next = !optimistic;
    start(async () => {
      setOptimistic(next);
      const res = await action(next);
      if (res.ok) {
        setValue(next);
        setError(null);
      } else if (res.needsLogin) {
        router.push(`/login?next=${encodeURIComponent(path)}`);
      } else {
        setError(res.error);
      }
    });
  }

  return { on: optimistic, delta: optimistic === initial ? 0 : optimistic ? 1 : -1, toggle, pending, error };
}
