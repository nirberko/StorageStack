import type { InputHTMLAttributes, ReactNode } from "react";
import "./Choice.css";

type ChoiceProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  /** A second, smaller line under the label. */
  description?: ReactNode;
};

function Choice({ type, className, label, description, disabled, ...input }: ChoiceProps & { type: "checkbox" | "radio"; className: string }) {
  return (
    <label className={className} data-disabled={disabled ? "" : undefined}>
      <input type={type} disabled={disabled} {...input} />
      <span className="ui-check-text">
        {label}
        {description && <small>{description}</small>}
      </span>
    </label>
  );
}

/** A checkbox with its label. Use for yes/no choices and for picking several items from a list. */
export function Checkbox(props: ChoiceProps) {
  return <Choice type="checkbox" className="ui-check" {...props} />;
}

/** A radio button with its label. Give every radio in a group the same `name`. */
export function Radio(props: ChoiceProps) {
  return <Choice type="radio" className="ui-check" {...props} />;
}

/** An on/off switch for a setting that takes effect right away, like "Deal alerts". */
export function Switch(props: ChoiceProps) {
  return <Choice type="checkbox" role="switch" className="ui-check ui-switch" {...props} />;
}
