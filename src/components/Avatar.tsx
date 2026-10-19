import { initials } from "@/lib/format";

type Props = { name: string; color: string; size?: number; radius?: number; fontSize?: number; label?: string };

export function Avatar({ name, color, size = 40, radius, fontSize, label }: Props) {
  return (
    <span
      className="m-avatar"
      aria-label={label}
      style={{
        width: size,
        height: size,
        borderRadius: radius ?? Math.round(size / 3.1),
        background: color,
        fontSize: fontSize ?? Math.max(10, Math.round(size / 3.1)),
      }}
    >
      {initials(name)}
    </span>
  );
}

export function Faces({ people }: { people: { name: string; color: string }[] }) {
  return (
    <span style={{ display: "flex", marginRight: 6 }}>
      {people.map((p, i) => (
        <span key={i} className="m-face" style={{ background: p.color }}>
          {initials(p.name)}
        </span>
      ))}
    </span>
  );
}
