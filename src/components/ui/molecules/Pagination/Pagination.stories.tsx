import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Pagination } from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "Molecules/Pagination",
  component: Pagination,
  parameters: { docs: { description: { component: "Links to the pages of a long list. Always shows the first and last page, the current one and its neighbours." } } },
};
export default meta;

export const Examples: StoryObj<typeof Pagination> = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      <Pagination page={1} total={3} hrefFor={(p) => `?page=${p}`} />
      <Pagination page={6} total={24} hrefFor={(p) => `?page=${p}`} />
      <Pagination page={24} total={24} hrefFor={(p) => `?page=${p}`} />
    </div>
  ),
};
