import type { HTMLAttributes } from "react";
import "./Badge.css";

export type Tone = "neutral" | "primary" | "ink" | "success" | "warning" | "danger";

/** A small label for a status or a category, like "Off market" or "Coming soon". */
export function Badge({ tone = "neutral", dot, children, className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone; dot?: boolean }) {
  return (
    <span {...rest} className={`ui-badge${className ? ` ${className}` : ""}`} data-tone={tone}>
      {dot && <span className="ui-badge-dot" aria-hidden />}
      {children}
    </span>
  );
}
