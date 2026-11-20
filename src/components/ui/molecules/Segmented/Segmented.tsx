import "./Segmented.css";

/** A row of options where exactly one is picked, like a sort order. Built from radio buttons, so arrow keys work. */
export function Segmented({ name, label, options, value, defaultValue, onChange }: { name: string; label: string; options: { value: string; label: string }[]; value?: string; defaultValue?: string; onChange?: (value: string) => void }) {
  return (
    <fieldset className="ui-seg" aria-label={label}>
      {options.map((o) => (
        <label key={o.value}>
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === undefined ? undefined : value === o.value}
            defaultChecked={value === undefined ? defaultValue === o.value : undefined}
            onChange={onChange ? () => onChange(o.value) : undefined}
          />
          {o.label}
        </label>
      ))}
    </fieldset>
  );
}
