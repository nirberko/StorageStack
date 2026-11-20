import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "../../atoms/Button/Button";
import { Dialog } from "./Dialog";

const meta: Meta<typeof Dialog> = {
  title: "Organisms/Dialog",
  component: Dialog,
  parameters: { docs: { description: { component: "For a decision that needs an answer before going on. The title asks the question; the main button repeats the action (\"Delete post\"), never just \"OK\". Escape and a click outside close it." } } },
};
export default meta;

function DeleteDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete post
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete this post?"
        actions={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setOpen(false)}>
              Delete post
            </Button>
          </>
        }
      >
        The post and its 4 replies will be removed for everyone. You can&apos;t undo this.
      </Dialog>
    </>
  );
}

export const ConfirmDelete: StoryObj<typeof Dialog> = {
  name: "Confirm a delete",
  render: () => <DeleteDemo />,
};
