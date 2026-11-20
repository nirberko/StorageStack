import { useId, type ReactNode } from "react";
import { Hint, Label } from "../../atoms/Label/Label";
import "./FormField.css";

export type FormFieldProps = {
  label: string;
  /** Help text under the control. Hidden while there is an error. */
  hint?: ReactNode;
  /** What went wrong and how to fix it. */
  error?: string;
  /** Adds "(optional)" after the label. */
  optional?: boolean;
  /** Sets the control's id; one is made up when left out. */
  id?: string;
  /** Renders the control, given the ids it must carry so the label and messages point at it. */
  children: (control: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
};

/** A label, a control and its help or error text, wired together for screen readers. */
export function FormField({ label, hint, error, optional, id, children }: FormFieldProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  const msgId = `${fieldId}-msg`;
  return (
    <div className="ui-field">
      <Label htmlFor={fieldId} optional={optional}>
        {label}
      </Label>
      {children({ id: fieldId, describedBy: error || hint ? msgId : undefined, invalid: !!error })}
      {error ? (
        <Hint id={msgId} error>
          {error}
        </Hint>
      ) : (
        hint && <Hint id={msgId}>{hint}</Hint>
      )}
    </div>
  );
}
