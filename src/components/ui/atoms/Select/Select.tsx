import type { SelectHTMLAttributes } from "react";
import "../Input/Input.css";
import "./Select.css";

/** A bare dropdown in its box. Uses the browser's own list, so it works with keyboards, screen readers and phones. Needs a label: use SelectField, or give it `aria-label`. */
export function Select({ invalid, disabled, children, ...select }: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <div className="ui-control" data-select="" data-error={invalid ? "" : undefined} data-disabled={disabled ? "" : undefined}>
      <select disabled={disabled} aria-invalid={invalid || undefined} {...select}>
        {children}
      </select>
      <svg className="ui-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}
