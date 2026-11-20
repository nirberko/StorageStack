import "./Verified.css";

/** The blue check next to a verified member's name. */
export function Verified({ label = "Verified member" }: { label?: string }) {
  return (
    <span className="ui-verified" role="img" aria-label={label} title={label}>
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12l5 5 9-10" />
      </svg>
    </span>
  );
}
