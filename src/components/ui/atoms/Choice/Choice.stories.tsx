import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Checkbox, Radio, Switch } from "./Choice";

const meta: Meta = {
  title: "Atoms/Choice",
  parameters: { docs: { description: { component: "**Checkbox** for yes/no or picking several. **Radio** for picking one of a few, all visible. **Switch** for a setting that applies right away." } } },
};
export default meta;

export const Checkboxes: StoryObj = {
  render: () => (
    <div style={{ display: "grid", gap: 14 }}>
      <Checkbox label="Off market only" defaultChecked />
      <Checkbox label="Value-add" />
      <Checkbox label="Include land" description="Parcels zoned for self storage" />
      <Checkbox label="Portfolio deals" disabled />
    </div>
  ),
};

export const Radios: StoryObj = {
  render: () => (
    <fieldset style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 14 }}>
      <legend style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--ds-ink)" }}>I want to</legend>
      <Radio name="goal" label="Buy a facility" defaultChecked />
      <Radio name="goal" label="Build one" />
      <Radio name="goal" label="Convert a building" />
    </fieldset>
  ),
};

export const Switches: StoryObj = {
  render: () => (
    <div style={{ display: "grid", gap: 14 }}>
      <Switch label="Deal alerts" description="Email me when a deal is posted in my areas" defaultChecked />
      <Switch label="Weekly digest" />
      <Switch label="Text messages" disabled />
    </div>
  ),
};
