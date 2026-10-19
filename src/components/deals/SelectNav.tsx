"use client";

import { useRouter, useSearchParams } from "next/navigation";

/** A select that updates one query parameter on change (filters and sorting). */
export function SelectNav({
  param, value, options, label, hideLabel, style,
}: {
  param: string;
  value: string;
  options: { value: string; label: string }[];
  label: string;
  hideLabel?: boolean;
  style?: React.CSSProperties;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const id = `sel-${param}`;
  return (
    <>
      <label htmlFor={id} className={hideLabel ? "sr-only" : undefined}>
        {label}
      </label>
      <select
        id={id}
        className="d-input"
        value={value}
        style={style}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          if (e.target.value) next.set(param, e.target.value);
          else next.delete(param);
          next.delete("limit");
          const s = next.toString();
          router.push(s ? `/deals?${s}` : "/deals", { scroll: false });
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </>
  );
}
