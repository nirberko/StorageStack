import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Segmented } from "./Segmented";

const meta: Meta<typeof Segmented> = {
  title: "Molecules/Segmented",
  component: Segmented,
  args: {
    name: "sort",
    label: "Sort",
    defaultValue: "new",
    options: [
      { value: "new", label: "Newest" },
      { value: "top", label: "Top" },
      { value: "open", label: "Unanswered" },
    ],
  },
  parameters: { docs: { description: { component: "One of 2–4 short options, like a sort order or a view. Built from radio buttons, so arrow keys move between options." } } },
};
export default meta;

export const Default: StoryObj<typeof Segmented> = {};
