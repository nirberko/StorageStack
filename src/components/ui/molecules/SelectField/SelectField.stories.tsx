import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SelectField } from "./SelectField";

const meta: Meta<typeof SelectField> = {
  title: "Molecules/SelectField",
  component: SelectField,
  parameters: { docs: { description: { component: "Label + Select + Hint. Use a dropdown when there are more than four or five options; for fewer, use radios or a segmented control so all choices are visible." } } },
};
export default meta;

export const States: StoryObj<typeof SelectField> = {
  render: () => (
    <div style={{ display: "grid", gap: 20, maxWidth: 380 }}>
      <SelectField label="Forum category" defaultValue="acq">
        <option value="start">Getting Started</option>
        <option value="feas">Market Research</option>
        <option value="acq">Buying a Facility</option>
        <option value="dev">Building New</option>
        <option value="fin">Financing</option>
      </SelectField>
      <SelectField label="State" defaultValue="" error="Pick a state">
        <option value="" disabled>
          Choose a state
        </option>
        <option>Idaho</option>
        <option>Texas</option>
      </SelectField>
      <SelectField label="Sort" disabled defaultValue="new">
        <option value="new">Newest</option>
      </SelectField>
    </div>
  ),
};
