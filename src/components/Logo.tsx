import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="m-logo">
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <rect width="34" height="34" rx="10" fill="#0B1F3A" />
        <rect x="8" y="9" width="18" height="16" rx="3" fill="#fff" />
        <path d="M11 13.5h12M11 17h12M11 20.5h12" stroke="#0B1F3A" strokeWidth="1.6" strokeLinecap="round" />
        <rect x="14" y="25" width="6" height="3" rx="1.5" fill="#F26B1D" />
      </svg>
      <span>
        Storage<span style={{ color: "#DB520B" }}>Stack</span>
      </span>
    </Link>
  );
}
