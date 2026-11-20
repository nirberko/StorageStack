import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Toast } from "./Toast";

const meta: Meta<typeof Toast> = {
  title: "Molecules/Toast",
  component: Toast,
  parameters: { docs: { description: { component: "A short confirmation after an action, with at most one action. Say what happened in past tense: \"Reply posted\", not \"Success!\"." } } },
};
export default meta;

export const Examples: StoryObj<typeof Toast> = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      <Toast action={{ label: "View", href: "#" }}>Reply posted</Toast>
      <Toast action={{ label: "Undo" }}>Post deleted</Toast>
      <Toast>Link copied</Toast>
    </div>
  ),
};
