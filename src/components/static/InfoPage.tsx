export function InfoPage({ kicker, title, intro, children }: { kicker: string; title: string; intro: string; children: React.ReactNode }) {
  return (
    <>
      <div className="wrap" style={{ paddingTop: 24 }}>
        <section className="m-hero">
          <div style={{ position: "relative", maxWidth: 720 }}>
            <span className="m-live">{kicker}</span>
            <h1>{title}</h1>
            <p>{intro}</p>
          </div>
        </section>
      </div>
      <div className="wrap" style={{ paddingTop: 24, paddingBottom: 56, display: "flex", flexDirection: "column", gap: 16 }}>
        {children}
      </div>
    </>
  );
}
