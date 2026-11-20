import { Icon } from "@/components/Icon";

// Storage Network Pro is not built yet: there is no plan, waitlist or payment backend.
// Every "Get early access" button links to the perks section (#pro) for now.

export function ProPill() {
  return <span className="h-pro">PRO</span>;
}

export function ProBanner() {
  return (
    <section className="h-banner" aria-labelledby="pro-banner-title">
      <svg width="96" height="80" viewBox="0 0 96 80" aria-hidden="true" style={{ flex: "none" }}>
        <path d="M8 34L44 14l36 20v40H8z" fill="#fff" stroke="#5B33B0" strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="18" y="42" width="22" height="32" rx="3" fill="#D9CCF7" />
        <rect x="48" y="42" width="22" height="32" rx="3" fill="#F26B1D" />
        <path d="M18 50h22M18 57h22M18 64h22M48 50h22M48 57h22M48 64h22" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.5" />
        <circle cx="78" cy="16" r="14" fill="#5B33B0" />
        <path d="M78 10v12M72 16h12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <div style={{ flex: "1 1 300px", minWidth: 0 }}>
        <span className="h-pro">COMING SOON</span>
        <h2 id="pro-banner-title" style={{ marginTop: 8, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#0F1B2D" }}>
          Storage Network Pro is on the way
        </h2>
        <p style={{ marginTop: 6, fontSize: 15, lineHeight: 1.55, color: "#3F3566" }}>
          Saved deal analyses, early access to new deals in the Deal Room and member perks from our partners.
        </p>
      </div>
      <a className="m-btn m-btn-pro" href="#pro">
        Get early access
      </a>
    </section>
  );
}

type Perk = {
  name: string;
  initials: string;
  site: string;
  url: string;
  offer: string;
  text: string;
  tags: string[];
  cta: string;
};

/** Partner perks. Add a partner here and it shows up in the row. */
const PERKS: Perk[] = [
  {
    name: "StorageLife",
    initials: "SL",
    site: "storagelife.com",
    url: "http://storagelife.com/",
    offer: "Self storage investing course",
    text: "A course on finding, buying and running self storage facilities.",
    tags: ["Education", "Investing"],
    cta: "View the course",
  },
];

export function ProPerks() {
  return (
    <section id="pro" aria-labelledby="pro-title" style={{ scrollMarginTop: 90, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <h2 id="pro-title" className="x-h2">
          Pro perks
        </h2>
        <ProPill />
      </div>
      <p className="x-sub">Learn faster and save on the tools you use to buy and run storage.</p>
      <div className="h-perks" style={{ marginTop: 14 }}>
        {PERKS.map((p) => (
          <article key={p.name} className="m-card h-perk">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="h-tile" style={{ background: "#0B1F3A", color: "#fff", fontWeight: 800, fontSize: 15 }} aria-hidden="true">
                {p.initials}
              </span>
              <span style={{ minWidth: 0, lineHeight: 1.35 }}>
                <b style={{ display: "block", fontSize: 16, fontWeight: 800 }}>{p.name}</b>
                <span style={{ display: "block", fontSize: 13, color: "#5E6B7E" }}>{p.site}</span>
              </span>
            </div>
            <div style={{ background: "#EAF6EF", border: "1.5px dashed #9BC9B0", borderRadius: 12, padding: "10px 12px", color: "#17603F", fontSize: 14, fontWeight: 800 }}>
              {p.offer}
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.55, color: "#4A576B" }}>{p.text}</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {p.tags.map((t) => (
                <span key={t} className="m-tag">
                  {t}
                </span>
              ))}
            </div>
            <a className="m-btn m-btn-line" href={p.url} target="_blank" rel="noopener" style={{ marginTop: "auto" }}>
              {p.cta} <span aria-hidden="true">↗</span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </article>
        ))}
        <article className="m-card h-perk soon">
          <span className="h-tile" style={{ background: "#5B33B0" }}>
            <Icon name="plus" size={20} stroke="#fff" strokeWidth={2.6} />
          </span>
          <b style={{ fontSize: 16, fontWeight: 800 }}>More perks with Pro</b>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: "#4A576B" }}>We are adding partners for lending, insurance and facility software.</p>
        </article>
      </div>
    </section>
  );
}
