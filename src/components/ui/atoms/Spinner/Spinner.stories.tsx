import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Spinner } from "./Spinner";

const meta: Meta<typeof Spinner> = {
  title: "Atoms/Spinner",
  component: Spinner,
  parameters: { docs: { description: { component: "Shows that something is loading. It takes the color of the text around it. Give it a `label` when it stands alone, so screen readers announce it." } } },
};
export default meta;

export const Sizes: StoryObj<typeof Spinner> = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 20, color: "var(--ds-primary)" }}>
      <Spinner size={14} />
      <Spinner />
      <Spinner size={24} label="Loading deals" />
    </div>
  ),
};
