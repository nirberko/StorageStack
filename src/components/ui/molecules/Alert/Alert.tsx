import type { ReactNode } from "react";
import "./Alert.css";

const ICON = {
  info: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 11v5M12 8h.01",
  success: "M12 3a9 9 0 100 18 9 9 0 000-18zM8 12l3 3 5-6",
  warning: "M12 3l9.5 17h-19zM12 10v4M12 17h.01",
  danger: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 8v5M12 16h.01",
};

/** A message that stays on the page: something to know, a success, a warning or an error. */
export function Alert({ tone = "info", title, children }: { tone?: keyof typeof ICON; title: string; children?: ReactNode }) {
  return (
    <div className="ui-alert" data-tone={tone} role={tone === "danger" ? "alert" : "status"}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={ICON[tone]} />
      </svg>
      <div>
        <b className="ui-alert-title">{title}</b>
        {children}
      </div>
    </div>
  );
}
