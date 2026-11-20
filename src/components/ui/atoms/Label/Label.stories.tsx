import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Hint, Label } from "./Label";

const meta: Meta<typeof Label> = {
  title: "Atoms/Label",
  component: Label,
  parameters: { docs: { description: { component: "The text parts of a form field: the **Label** above a control and the **Hint** under it (help, or an error). FormField puts them together." } } },
};
export default meta;

export const All: StoryObj<typeof Label> = {
  render: () => (
    <div style={{ display: "grid", gap: 10 }}>
      <Label>Asking price</Label>
      <Label optional>Website</Label>
      <Hint>Before closing costs</Hint>
      <Hint error>Enter a number, like 412</Hint>
    </div>
  ),
};
