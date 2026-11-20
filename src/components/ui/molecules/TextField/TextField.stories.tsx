import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Icon } from "@/components/Icon";
import { TextField } from "./TextField";

const meta: Meta<typeof TextField> = {
  title: "Molecules/TextField",
  component: TextField,
  args: { label: "Asking price", prefix: "$", hint: "Before closing costs", defaultValue: "3,200,000" },
  parameters: { docs: { description: { component: "Label + Input + Hint. Every field has a visible label. An error replaces the help text and says what went wrong and how to fix it." } } },
};
export default meta;
type Story = StoryObj<typeof TextField>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 20, maxWidth: 380 }}>
      <TextField label="Email" type="email" placeholder="you@example.com" />
      <TextField label="Asking price" prefix="$" defaultValue="3,200,000" hint="Before closing costs" inputMode="numeric" />
      <TextField label="Rentable area" suffix="sq ft" defaultValue="58,000" inputMode="numeric" />
      <TextField label="Units" defaultValue="four hundred" error="Enter a number, like 412" />
      <TextField label="State" defaultValue="Idaho" disabled />
      <TextField label="Website" optional placeholder="https://" />
      <TextField label="Search" placeholder="Discussions, markets, people" prefix={<Icon name="search" size={16} />} />
    </div>
  ),
};
