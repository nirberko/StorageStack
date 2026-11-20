import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Atoms/Badge",
  component: Badge,
  args: { children: "Off market", tone: "ink" },
  argTypes: { tone: { control: "inline-radio", options: ["neutral", "primary", "ink", "success", "warning", "danger"] } },
  parameters: { docs: { description: { component: "Short labels for a status or a type. Status colors only for status: green done, amber needs attention, red closed or failed." } } },
};
export default meta;

export const Playground: StoryObj<typeof Badge> = {};

export const Tones: StoryObj<typeof Badge> = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      <Badge tone="ink">Off market</Badge>
      <Badge tone="primary" dot>
        Coming soon
      </Badge>
      <Badge>Value-add</Badge>
      <Badge tone="success" dot>
        Live now
      </Badge>
      <Badge tone="warning">In review</Badge>
      <Badge tone="danger">Closed</Badge>
    </div>
  ),
};
