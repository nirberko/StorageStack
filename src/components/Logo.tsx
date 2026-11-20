import Link from "next/link";

/** The site logo: the Ocean-blue storage unit with two eyes peeking out from under its door, then the name. Links home. */
export function Logo() {
  return (
    <Link href="/" className="m-logo">
      <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill="#0369A1" />
        <path d="M13 17h38M13 26h38" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
        <rect x="10" y="35" width="44" height="19" rx="7" fill="#0F1420" />
        <circle cx="24" cy="44.5" r="4.6" fill="#fff" />
        <circle cx="40" cy="44.5" r="4.6" fill="#fff" />
        <circle cx="25" cy="43.6" r="2" fill="#0F1420" />
        <circle cx="41" cy="43.6" r="2" fill="#0F1420" />
      </svg>
      <span>
        The Storage <span style={{ color: "var(--ds-primary)" }}>Network</span>
      </span>
    </Link>
  );
}
