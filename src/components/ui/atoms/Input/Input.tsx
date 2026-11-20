import type { InputHTMLAttributes, ReactNode } from "react";
import "./Input.css";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> & {
  /** Text or an icon inside the box before the value, like "$". */
  prefix?: ReactNode;
  /** Text or an icon inside the box after the value, like "sq ft". */
  suffix?: ReactNode;
  /** Turns the box red. Pair it with an error message (TextField does). */
  invalid?: boolean;
};

/** A bare text input in its box. Needs a label: use TextField, or give it `aria-label`. */
export function Input({ prefix, suffix, invalid, disabled, ...input }: InputProps) {
  return (
    <div className="ui-control" data-error={invalid ? "" : undefined} data-disabled={disabled ? "" : undefined}>
      {prefix && <span className="ui-affix">{prefix}</span>}
      <input disabled={disabled} aria-invalid={invalid || undefined} {...input} />
      {suffix && <span className="ui-affix">{suffix}</span>}
    </div>
  );
}
