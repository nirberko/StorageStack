import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Icon } from "@/components/Icon";
import { IconButton } from "../../atoms/Button/Button";
import { Tooltip } from "./Tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Molecules/Tooltip",
  component: Tooltip,
  parameters: { docs: { description: { component: "A few words that name an icon button, shown on hover and keyboard focus. Never put the only copy of important information here; phones have no hover." } } },
};
export default meta;

export const Sides: StoryObj<typeof Tooltip> = {
  render: () => (
    <div style={{ padding: "48px 0", display: "flex", gap: 12 }}>
      <Tooltip text="Save for later">
        <IconButton label="Save" icon={<Icon name="bookmark" size={16} />} />
      </Tooltip>
      <Tooltip text="Copy link" side="bottom">
        <IconButton label="Share" icon={<Icon name="share" size={16} />} />
      </Tooltip>
    </div>
  ),
};
