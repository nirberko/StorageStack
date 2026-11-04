import Link from "next/link";
import { Icon } from "@/components/Icon";
import type { IconName } from "@/lib/icons";

const LINKS: { href: string; icon: IconName; tint: string; ink: string; title: string; sub: string }[] = [
  { href: "/tools", icon: "calculator", tint: "#FFEDE2", ink: "#B5440A", title: "Tools", sub: "Run the numbers on a deal" },
  { href: "/learn", icon: "bulb", tint: "#DDF3E8", ink: "#17603F", title: "Learn", sub: "Guides, case studies and the glossary" },
  { href: "/guidelines", icon: "shieldCheck", tint: "#E6EBF3", ink: "#0B1F3A", title: "Community guidelines", sub: "How we keep the forums useful" },
];

// Phase 1 features still being built, so members know what is on the way.
const SOON = ["Member directory", "Vendor directory", "Events calendar"];

/** Shortcuts beside the home feed, plus what is coming next. */
export function Explore() {
  return (
    <section className="m-card" style={{ padding: 22 }} aria-labelledby="explore-title">
      <h2 id="explore-title" style={{ fontSize: 17, fontWeight: 800, marginBottom: 14 }}>
        Explore
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {LINKS.map((l) => (
          <Link key={l.href} className="h-deal" href={l.href}>
            <span className="m-ic" style={{ width: 40, height: 40, borderRadius: 12, background: l.tint }}>
              <Icon name={l.icon} size={18} stroke={l.ink} />
            </span>
            <span style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
              <b style={{ display: "block", fontSize: 14 }}>{l.title}</b>
              <span style={{ display: "block", fontSize: 13, color: "#5E6B7E" }}>{l.sub}</span>
            </span>
            <Icon name="chevron" size={18} stroke="#5E6B7E" style={{ flex: "none" }} />
          </Link>
        ))}
      </div>
      <div style={{ borderTop: "1px solid #EEF1F5", marginTop: 16, paddingTop: 14 }}>
        <span className="h-eyebrow" style={{ marginBottom: 8 }}>
          Coming soon
        </span>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SOON.map((s) => (
            <li key={s} className="m-tag">
              {s}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
