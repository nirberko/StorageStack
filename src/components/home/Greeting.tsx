"use client";

import { useSyncExternalStore } from "react";
import { partOfDay } from "@/lib/format";

const noop = () => () => {};

/**
 * "Good morning, Dana". The server does not know the member's time zone, so it renders
 * `serverPart` and the browser switches to its own clock once hydrated.
 */
export function Greeting({ firstName, serverPart }: { firstName: string; serverPart: string }) {
  const part = useSyncExternalStore(noop, () => partOfDay(new Date().getHours()), () => serverPart);
  return (
    <h1 className="h-hi">
      Good {part}, {firstName}
    </h1>
  );
}
