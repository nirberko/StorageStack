import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tabs } from "./Tabs";

const meta: Meta<typeof Tabs> = {
  title: "Organisms/Tabs",
  component: Tabs,
  parameters: { docs: { description: { component: "Switch between views of the same thing. Arrow keys, Home and End move between tabs." } } },
};
export default meta;

const panel = (text: string) => <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--ds-body)" }}>{text}</p>;

export const Listing: StoryObj<typeof Tabs> = {
  render: () => (
    <Tabs
      label="Listing"
      items={[
        { id: "overview", label: "Overview", content: panel("412 units on 4.2 acres, built in 2004. Climate controlled units in two buildings.") },
        { id: "numbers", label: "Numbers", content: panel("Asking $3,200,000. Net operating income $224,000. Cap rate 7.0%.") },
        { id: "photos", label: "Photos", content: panel("Photos appear here.") },
        { id: "questions", label: "Questions", content: panel("Ask the seller a question.") },
      ]}
    />
  ),
};
