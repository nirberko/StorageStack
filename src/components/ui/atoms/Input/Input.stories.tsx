import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Icon } from "@/components/Icon";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Atoms/Input",
  component: Input,
  args: { "aria-label": "Asking price", prefix: "$", defaultValue: "3,200,000" },
  parameters: { docs: { description: { component: "The bare text box. On its own it has no visible label, so in forms use **TextField** (a molecule) instead. Use the bare Input only where the context names it, like a search bar with `aria-label`." } } },
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, maxWidth: 360 }}>
      <Input aria-label="Email" placeholder="you@example.com" />
      <Input aria-label="Asking price" prefix="$" defaultValue="3,200,000" />
      <Input aria-label="Area" suffix="sq ft" defaultValue="58,000" />
      <Input aria-label="Units" defaultValue="four hundred" invalid />
      <Input aria-label="State" defaultValue="Idaho" disabled />
      <Input aria-label="Search" placeholder="Search discussions" prefix={<Icon name="search" size={16} />} />
    </div>
  ),
};
