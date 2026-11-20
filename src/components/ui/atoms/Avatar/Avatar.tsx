import "./Avatar.css";

/** Muted colors for initials avatars, picked from the name so a person always gets the same one. */
const COLORS = ["#44669E", "#B5644A", "#3E7A5F", "#7A5BA6", "#A0584F", "#3F7C8C", "#8A6A2F"];

function colorFor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return COLORS[h % COLORS.length];
}

/** A person's photo, or their first initial on a color of their own. */
export function Avatar({ name, src, size = 32, color }: { name: string; src?: string; size?: number; color?: string }) {
  return (
    <span className="ui-avatar" role="img" aria-label={name} title={name} style={{ width: size, height: size, fontSize: Math.round(size * 0.42), background: src ? undefined : (color ?? colorFor(name)) }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- avatars come from many hosts and are tiny */}
      {src ? <img src={src} alt="" /> : <span aria-hidden>{name.trim()[0]?.toUpperCase()}</span>}
    </span>
  );
}
