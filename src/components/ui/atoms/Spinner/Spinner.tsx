import "./Spinner.css";

/** A turning ring that shows something is loading. Takes the text color around it. */
export function Spinner({ size = 16, label }: { size?: number; label?: string }) {
  return <span className="ui-spinner" style={{ width: size, height: size }} role={label ? "status" : undefined} aria-label={label} aria-hidden={label ? undefined : true} />;
}
