import Link from "next/link";

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

export function InfoCard({ title, text, href, cta, soon }: { title: string; text: string; href?: string; cta?: string; soon?: boolean }) {
  return (
    <div className="m-card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: 17, fontWeight: 800 }}>{title}</h2>
        {soon && (
          <span className="m-badge" style={{ background: "#FBF1DD", color: "#8A5A12" }}>
            Coming soon
          </span>
        )}
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: "#4A576B" }}>{text}</p>
      {href && cta && (
        <Link href={href} style={{ fontSize: 14, fontWeight: 700, color: "#DB520B", marginTop: "auto" }}>
          {cta}
        </Link>
      )}
    </div>
  );
}
