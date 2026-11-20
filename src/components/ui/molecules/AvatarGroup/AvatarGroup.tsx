import { Avatar } from "../../atoms/Avatar/Avatar";
import "./AvatarGroup.css";

/** Several avatars overlapping, for "who answered" or "who is here". */
export function AvatarGroup({ names, size = 28, max = 4 }: { names: string[]; size?: number; max?: number }) {
  return (
    <span className="ui-avatars" role="group" aria-label={names.join(", ")}>
      {names.slice(0, max).map((n) => (
        <Avatar key={n} name={n} size={size} />
      ))}
    </span>
  );
}
