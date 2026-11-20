import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Verified } from "../Verified/Verified";
import { Avatar } from "./Avatar";

const meta: Meta<typeof Avatar> = {
  title: "Atoms/Avatar",
  component: Avatar,
  args: { name: "Dana Ruiz", size: 36 },
  parameters: { docs: { description: { component: "A member's photo, or their initial on a color picked from their name, so the same person always gets the same color." } } },
};
export default meta;

export const Playground: StoryObj<typeof Avatar> = {};

export const Sizes: StoryObj<typeof Avatar> = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <Avatar name="Dana Ruiz" size={24} />
      <Avatar name="Dana Ruiz" size={32} />
      <Avatar name="Dana Ruiz" />
      <Avatar name="Dana Ruiz" size={48} />
    </div>
  ),
};

export const WithVerifiedCheck: StoryObj<typeof Avatar> = {
  name: "With the verified check",
  render: () => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "var(--ds-ink)" }}>
      <Avatar name="Mark Ellis" size={32} />
      Mark Ellis
      <Verified />
    </span>
  ),
};
