import Link from "next/link";
import type { ReactNode } from "react";
import "./Toast.css";

/** A short confirmation after an action, like "Reply posted", with one optional action. Show it, then remove it after a few seconds. */
export function Toast({ children, action }: { children: ReactNode; action?: { label: string; href?: string; onClick?: () => void } }) {
  return (
    <div className="ui-toast" role="status">
      <span className="ui-toast-text">{children}</span>
      {action &&
        (action.href ? (
          <Link className="ui-toast-action" href={action.href}>
            {action.label}
          </Link>
        ) : (
          <button type="button" className="ui-toast-action" onClick={action.onClick}>
            {action.label}
          </button>
        ))}
    </div>
  );
}
