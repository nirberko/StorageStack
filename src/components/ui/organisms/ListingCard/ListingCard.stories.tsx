import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ListingCard } from "./ListingCard";

const meta: Meta<typeof ListingCard> = {
  title: "Organisms/ListingCard",
  component: ListingCard,
  args: { name: "Riverside Self Storage", place: "Boise, ID", units: 412, sqft: 58000, price: 3200000, capRate: 7, occupancy: 91, tag: "Off market" },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}>{Story()}</div>],
  parameters: { docs: { description: { component: "A facility for sale in the Deal Room: Card + Badge + the key numbers. The cap rate is the one number in blue. Example data." } } },
};
export default meta;
type Story = StoryObj<typeof ListingCard>;

export const OffMarket: Story = { name: "Off market" };

export const Land: Story = {
  args: { name: "Land on Route 9", place: "Nampa, ID", units: undefined, sqft: undefined, price: 640000, capRate: undefined, occupancy: undefined, tag: "Land" },
};

export const Clickable: Story = { args: { href: "#" } };
