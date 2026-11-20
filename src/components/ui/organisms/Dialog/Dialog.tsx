"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import "./Dialog.css";

/**
 * A modal dialog for a decision that needs an answer before going on, like "Delete this post?".
 * Built on the browser's <dialog>, so focus is trapped and Escape closes it.
 */
export function Dialog({ open, onClose, title, children, actions }: { open: boolean; onClose: () => void; title: string; children?: ReactNode; actions?: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="ui-dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ui-dialog-in">
        <h2 className="ui-dialog-title" id={titleId}>
          {title}
        </h2>
        {children && <div className="ui-dialog-body">{children}</div>}
        {actions && <div className="ui-dialog-actions">{actions}</div>}
      </div>
    </dialog>
  );
}
