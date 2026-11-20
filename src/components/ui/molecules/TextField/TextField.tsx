import { Input, type InputProps } from "../../atoms/Input/Input";
import { FormField, type FormFieldProps } from "../FormField/FormField";

export type TextFieldProps = Omit<FormFieldProps, "children"> & Omit<InputProps, "invalid" | "id">;

/** A labeled text input with help text or an error. */
export function TextField({ label, hint, error, optional, id, ...input }: TextFieldProps) {
  return (
    <FormField label={label} hint={hint} error={error} optional={optional} id={id}>
      {({ id: inputId, describedBy, invalid }) => <Input id={inputId} aria-describedby={describedBy} invalid={invalid} {...input} />}
    </FormField>
  );
}
