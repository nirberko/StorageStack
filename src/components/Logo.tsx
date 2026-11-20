import { useId } from "react";
import Link from "next/link";

/** The site logo: the orange storage unit with two eyes peeking out from under its door, then the name. Links home. */
export function Logo() {
  const gradient = useId();
  return (
    <Link href="/" className="m-logo">
      <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFB04F" />
            <stop offset="1" stopColor="#EE4E12" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="18" fill={`url(#${gradient})`} />
        <path d="M13 17h38M13 26h38" stroke="#fff" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
        <rect x="10" y="35" width="44" height="19" rx="7" fill="#0B1F3A" />
        <circle cx="24" cy="44.5" r="4.6" fill="#fff" />
        <circle cx="40" cy="44.5" r="4.6" fill="#fff" />
        <circle cx="25" cy="43.6" r="2" fill="#0B1F3A" />
        <circle cx="41" cy="43.6" r="2" fill="#0B1F3A" />
      </svg>
      <span>
        The Storage <span style={{ color: "#DB520B" }}>Network</span>
      </span>
    </Link>
  );
}
