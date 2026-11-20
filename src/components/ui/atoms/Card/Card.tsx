import Link from "next/link";
import type { HTMLAttributes } from "react";
import "./Card.css";

/** A surface that groups related content. Pass `href` to make the whole card a link. */
export function Card({ tone = "surface", pad = "md", href, children, className, ...rest }: HTMLAttributes<HTMLDivElement> & { tone?: "surface" | "fill"; pad?: "none" | "sm" | "md" | "lg"; href?: string }) {
  const data = { className: `ui-card${className ? ` ${className}` : ""}`, "data-tone": tone, "data-pad": pad === "none" ? undefined : pad };
  if (href)
    return (
      <Link href={href} {...data}>
        {children}
      </Link>
    );
  return (
    <div {...rest} {...data}>
      {children}
    </div>
  );
}
