import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "../../atoms/Input/Input";
import { FormField } from "./FormField";

const meta: Meta<typeof FormField> = {
  title: "Molecules/FormField",
  component: FormField,
  parameters: { docs: { description: { component: "The frame every field uses: label on top, control, then help or error text, all linked for screen readers. TextField and SelectField are built on it; use it directly for a control that has no field of its own yet." } } },
};
export default meta;

export const WithAnyControl: StoryObj<typeof FormField> = {
  name: "With any control",
  render: () => (
    <div style={{ maxWidth: 380 }}>
      <FormField label="Net operating income" hint="Income minus expenses, before the loan">
        {({ id, describedBy, invalid }) => <Input id={id} aria-describedby={describedBy} invalid={invalid} prefix="$" defaultValue="224,000" />}
      </FormField>
    </div>
  ),
};
