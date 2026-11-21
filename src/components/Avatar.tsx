import { avatarUrl } from "@/lib/avatar";
import { initials } from "@/lib/format";

type Props = {
  name: string;
  color: string;
  /** Storage path of the member's profile photo. Falls back to colored initials when empty. */
  photo?: string | null;
  size?: number;
  radius?: number;
  fontSize?: number;
  label?: string;
};

export function Avatar({ name, color, photo, size = 40, radius, fontSize, label }: Props) {
  const src = avatarUrl(photo);
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
      {src ? (
        // Supabase serves the photo; next/image optimization is not available on Workers.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={label ?? ""} width={size} height={size} loading="lazy" decoding="async" />
      ) : (
        initials(name)
      )}
    </span>
  );
}

export function Faces({ people }: { people: { name: string; color: string; photo?: string | null }[] }) {
  return (
    <span style={{ display: "flex", marginRight: 6 }}>
      {people.map((p, i) => {
        const src = avatarUrl(p.photo);
        return (
          <span key={i} className="m-face" style={{ background: p.color }}>
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="" width={26} height={26} loading="lazy" decoding="async" />
            ) : (
              initials(p.name)
            )}
          </span>
        );
      })}
    </span>
  );
}
