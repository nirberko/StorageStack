import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card } from "./Card";

const meta: Meta<typeof Card> = {
  title: "Atoms/Card",
  component: Card,
  parameters: { docs: { description: { component: "A surface that groups related content. **Surface** is white with a 1px border, **fill** is gray with none. Pass `href` and the whole card becomes a link." } } },
};
export default meta;

const text = (title: string, body: string) => (
  <>
    <b style={{ fontSize: 14 }}>{title}</b>
    <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--ds-body)" }}>{body}</p>
  </>
);

export const Kinds: StoryObj<typeof Card> = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
      <Card>{text("Surface", "White with a 1px border. The default.")}</Card>
      <Card tone="fill">{text("Fill", "Gray, no border. For groups inside a page.")}</Card>
      <Card href="#">{text("Link", "The whole card is clickable.")}</Card>
    </div>
  ),
};
