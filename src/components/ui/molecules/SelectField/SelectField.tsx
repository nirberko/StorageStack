import type { SelectHTMLAttributes } from "react";
import { Select } from "../../atoms/Select/Select";
import { FormField, type FormFieldProps } from "../FormField/FormField";

export type SelectFieldProps = Omit<FormFieldProps, "children"> & Omit<SelectHTMLAttributes<HTMLSelectElement>, "id">;

/** A labeled dropdown with help text or an error. */
export function SelectField({ label, hint, error, optional, id, children, ...select }: SelectFieldProps) {
  return (
    <FormField label={label} hint={hint} error={error} optional={optional} id={id}>
      {({ id: selectId, describedBy, invalid }) => (
        <Select id={selectId} aria-describedby={describedBy} invalid={invalid} {...select}>
          {children}
        </Select>
      )}
    </FormField>
  );
}
