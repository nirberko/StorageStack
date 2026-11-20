import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Icon } from "@/components/Icon";
import { Button, IconButton } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  args: { children: "Join free", variant: "primary" },
  argTypes: { variant: { control: "inline-radio", options: ["primary", "soft", "neutral", "ink", "ghost", "danger"] }, size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
  parameters: { docs: { description: { component: "Use one **primary** button per screen for the main action. Use **soft** for a second action and **neutral** for the rest. **Ghost** is for low-key actions like Cancel, **danger** for deleting. Pass `href` to get a link that looks like a button." } } },
};
export default meta;
type Story = StoryObj<typeof Button>;

const row = { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 } as const;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={row}>
      <Button variant="primary">Join free</Button>
      <Button variant="soft">Share a deal</Button>
      <Button variant="neutral">Browse the forums</Button>
      <Button variant="ink">Ink</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="danger">Delete post</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={row}>
      <Button variant="primary" size="sm">
        Small
      </Button>
      <Button variant="primary">Medium</Button>
      <Button variant="primary" size="lg">
        Large
      </Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={row}>
      <Button variant="primary">Default</Button>
      <Button variant="primary" disabled>
        Disabled
      </Button>
      <Button variant="primary" loading>
        Saving
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  name: "With icons",
  render: () => (
    <div style={row}>
      <Button variant="primary" iconStart={<Icon name="plus" size={16} />}>
        New post
      </Button>
      <Button variant="soft" iconEnd={<Icon name="arrowRight" size={16} />}>
        Next
      </Button>
      <IconButton label="Save" icon={<Icon name="bookmark" size={16} />} />
      <IconButton label="Share" variant="ghost" icon={<Icon name="share" size={16} />} />
    </div>
  ),
};

export const AsLink: Story = {
  name: "As a link",
  render: () => (
    <Button variant="primary" href="/signup">
      Join free
    </Button>
  ),
};

export const FullWidth: Story = {
  name: "Full width",
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Button variant="primary" full>
        Create account
      </Button>
    </div>
  ),
};
