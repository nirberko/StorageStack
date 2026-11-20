import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AvatarGroup } from "./AvatarGroup";

const meta: Meta<typeof AvatarGroup> = {
  title: "Molecules/AvatarGroup",
  component: AvatarGroup,
  args: { names: ["Tom Brandt", "Priya Shah", "Mark Ellis"], size: 32 },
  parameters: { docs: { description: { component: "A few people at once, like who answered a question. Shows up to `max` avatars." } } },
};
export default meta;

export const Default: StoryObj<typeof AvatarGroup> = {};
