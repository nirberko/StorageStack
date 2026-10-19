export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="wrap" style={{ paddingTop: 40, paddingBottom: 64, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "stretch" }}>
      <section className="m-hero" style={{ flex: "1 1 380px", display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: 360 }}>
        <svg width="260" height="200" viewBox="0 0 160 120" aria-hidden="true" style={{ position: "absolute", right: -20, top: -10 }}>
          <g fill="none" stroke="#fff" strokeOpacity="0.12" strokeWidth="2">
            <rect x="10" y="10" width="40" height="50" rx="6" />
            <rect x="58" y="10" width="40" height="50" rx="6" />
            <rect x="10" y="68" width="40" height="50" rx="6" />
          </g>
          <rect x="58" y="68" width="40" height="50" rx="6" fill="#F26B1D" fillOpacity="0.8" />
        </svg>
        <div style={{ position: "relative" }}>
          <span className="m-live">The self storage community</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </section>
      <div className="m-card" style={{ flex: "1 1 380px", maxWidth: 520, padding: "32px 32px 28px" }}>
        {children}
      </div>
    </div>
  );
}
