import type { Preview } from "@storybook/nextjs-vite";
import "../src/components/ui/foundations/tokens.css";

/** Every story renders on the page color, in light or dark, picked from the toolbar. */
const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Light or dark",
      toolbar: { title: "Theme", icon: "mirror", items: ["light", "dark"], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, { globals }) => (
      <div data-theme={globals.theme} className="ui-root" style={{ background: "var(--ds-page)", padding: 24, minHeight: "100%" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    options: { storySort: { order: ["Foundations", "Atoms", "Molecules", "Organisms"] } },
    controls: { matchers: { color: /(background|color)$/i } },
    a11y: { test: "error" },
  },
  tags: ["autodocs"],
};

export default preview;
