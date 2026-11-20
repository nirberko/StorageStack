import type { ReactNode } from "react";
import "./Tooltip.css";

/** A short label that shows on hover and keyboard focus. Keep it to a few words; never put the only copy of important text here. */
export function Tooltip({ text, side = "top", children }: { text: string; side?: "top" | "bottom"; children: ReactNode }) {
  return (
    <span className="ui-tip">
      {children}
      <span className="ui-tip-bubble" role="tooltip" data-side={side}>
        {text}
      </span>
    </span>
  );
}
