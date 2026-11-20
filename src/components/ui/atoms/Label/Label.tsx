import type { LabelHTMLAttributes, ReactNode } from "react";
import "./Label.css";

/** The name of a form control, shown above it. `optional` adds "(optional)". */
export function Label({ optional, children, className, ...rest }: LabelHTMLAttributes<HTMLLabelElement> & { optional?: boolean }) {
  return (
    <label {...rest} className={`ui-label${className ? ` ${className}` : ""}`}>
      {children}
      {optional && <span className="ui-optional"> (optional)</span>}
    </label>
  );
}

/** Small text under a control: help, or an error when `error` is set. */
export function Hint({ id, error, children }: { id?: string; error?: boolean; children: ReactNode }) {
  return (
    <span className="ui-hint" id={id} data-error={error ? "" : undefined}>
      {children}
    </span>
  );
}
