import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta = {
  title: "Foundations",
  parameters: { docs: { description: { component: "The tokens every component is built from. They live in src/design/tokens.css. Flat: no shadows. Blue only means \"click this\" or \"selected\"; everything else is ink and gray." } } },
};
export default meta;

const COLORS: [string, string, string][] = [
  ["Primary", "--ds-primary", "Buttons, links, selected items, focus"],
  ["Primary hover", "--ds-primary-hover", "Primary under the pointer"],
  ["Primary soft", "--ds-primary-soft", "Soft buttons, selected rows, info"],
  ["Primary text", "--ds-primary-text", "Blue text on light backgrounds"],
  ["Ink", "--ds-ink", "Headings and strong text"],
  ["Body", "--ds-body", "Paragraphs"],
  ["Muted", "--ds-muted", "Help text, meta, placeholders"],
  ["Fill", "--ds-fill", "Neutral buttons, inputs off, groups"],
  ["Line", "--ds-line", "Card and divider borders"],
  ["Line strong", "--ds-line-strong", "Input and checkbox borders"],
  ["Page", "--ds-page", "Page background"],
  ["Success", "--ds-success", "Done, live, saved"],
  ["Warning", "--ds-warning", "Needs attention"],
  ["Danger", "--ds-danger", "Errors and deleting"],
];

export const Colors: StoryObj = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
      {COLORS.map(([name, token, use]) => (
        <div key={token} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ height: 72, borderRadius: 14, background: `var(${token})`, boxShadow: "inset 0 0 0 1px var(--ds-line)" }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ds-ink)" }}>{name}</div>
          <code style={{ fontSize: 12, color: "var(--ds-muted)" }}>{token}</code>
          <div style={{ fontSize: 13, color: "var(--ds-body)" }}>{use}</div>
        </div>
      ))}
    </div>
  ),
};

const TYPE: [string, string, number, string][] = [
  ["Display", "--ds-text-display", 700, "Find your next facility"],
  ["H1", "--ds-text-h1", 700, "Off-market deals"],
  ["H2", "--ds-text-h2", 600, "Is this a good deal?"],
  ["H3", "--ds-text-h3", 600, "Riverside Self Storage"],
  ["Body", "--ds-text-body", 400, "Members share what they paid, what went wrong and what they would do again."],
  ["Small", "--ds-text-small", 500, "Boise, ID · 412 units · 58,000 sq ft"],
  ["Caption", "--ds-text-caption", 500, "Posted 2 hours ago"],
];

export const Type: StoryObj = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, color: "var(--ds-ink)" }}>
      {TYPE.map(([name, token, weight, sample]) => (
        <div key={token} style={{ display: "flex", alignItems: "baseline", gap: 24, flexWrap: "wrap" }}>
          <code style={{ width: 160, flex: "none", fontSize: 12, color: "var(--ds-muted)" }}>
            {name} · {token}
          </code>
          <span style={{ fontSize: `var(${token})`, fontWeight: weight, letterSpacing: weight === 700 ? "-0.035em" : "-0.01em", lineHeight: 1.15 }}>{sample}</span>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
        <code style={{ width: 160, flex: "none", fontSize: 12, color: "var(--ds-muted)" }}>Numbers · tabular</code>
        <span style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>$3,200,000 · 7.0% · 91%</span>
      </div>
    </div>
  ),
};

export const SpaceAndShape: StoryObj = {
  name: "Space and shape",
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 48, color: "var(--ds-muted)", fontSize: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ width: `var(--ds-space-${n})`, height: `var(--ds-space-${n})`, background: "var(--ds-primary)" }} />
            space-{n}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
        {[
          ["item", "7"],
          ["control", "10"],
          ["card", "14"],
          ["round", "999"],
        ].map(([n, px]) => (
          <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ width: 56, height: 56, borderRadius: `var(--ds-radius-${n})`, background: "var(--ds-fill-hover)" }} />
            {n} · {px}
          </div>
        ))}
      </div>
    </div>
  ),
};
