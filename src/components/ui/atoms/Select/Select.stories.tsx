import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Select } from "./Select";

const meta: Meta<typeof Select> = {
  title: "Atoms/Select",
  component: Select,
  parameters: { docs: { description: { component: "The bare dropdown box. In forms use **SelectField** (a molecule) for the label and messages. It uses the browser's own list, so it works with keyboards, screen readers and phones." } } },
};
export default meta;

export const States: StoryObj<typeof Select> = {
  render: () => (
    <div style={{ display: "grid", gap: 12, maxWidth: 360 }}>
      <Select aria-label="Sort" defaultValue="new">
        <option value="new">Newest</option>
        <option value="top">Top</option>
      </Select>
      <Select aria-label="State" defaultValue="" invalid>
        <option value="" disabled>
          Choose a state
        </option>
        <option>Idaho</option>
      </Select>
      <Select aria-label="Category" disabled defaultValue="acq">
        <option value="acq">Buying a Facility</option>
      </Select>
    </div>
  ),
};
