import type { CSSProperties } from "react";
import { ICONS, type IconName } from "@/lib/icons";

type Props = {
  name?: IconName;
  d?: string;
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  style?: CSSProperties;
  className?: string;
};

/** A stroke icon from the design's icon set, or any 24×24 path via `d`. Decorative by default. */
export function Icon({ name, d, size = 16, stroke = "currentColor", strokeWidth = 2, fill = "none", style, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
      className={className}
    >
      <path d={d ?? (name ? ICONS[name] : "")} />
    </svg>
  );
}
