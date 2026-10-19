export function Verified({ size = 16, label = "Verified member" }: { size?: number; label?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={label} style={{ flex: "none" }}>
      <circle cx="12" cy="12" r="10" fill="#DB520B" />
      <path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
