import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Alert } from "./Alert";

const meta: Meta<typeof Alert> = {
  title: "Molecules/Alert",
  component: Alert,
  args: { title: "The Deal Room opens soon", children: "Members hear first.", tone: "info" },
  argTypes: { tone: { control: "inline-radio", options: ["info", "success", "warning", "danger"] } },
  parameters: { docs: { description: { component: "A message that stays on the page until the problem is fixed or the page changes. For a quick confirmation after an action, use a Toast." } } },
};
export default meta;

export const Playground: StoryObj<typeof Alert> = {};

export const Tones: StoryObj<typeof Alert> = {
  render: () => (
    <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
      <Alert title="The Deal Room opens soon">Members hear first.</Alert>
      <Alert tone="success" title="Profile saved" />
      <Alert tone="warning" title="Your email is not confirmed">
        Check your inbox for the link.
      </Alert>
      <Alert tone="danger" title="Your post was not saved">
        Check your connection and try again.
      </Alert>
    </div>
  ),
};
