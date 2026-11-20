import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "../Spinner/Spinner";
import "./Button.css";

export type ButtonVariant = "primary" | "soft" | "neutral" | "ink" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type Common = {
  /** primary: the one main action on a screen. soft: a second action. neutral: everything else. ink: strong but not blue. ghost: low-key, like Cancel. danger: deletes something. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and blocks clicks while something is saving. */
  loading?: boolean;
  /** An icon before the label. */
  iconStart?: ReactNode;
  /** An icon after the label. */
  iconEnd?: ReactNode;
  /** Stretches the button to its container's width. */
  full?: boolean;
  children?: ReactNode;
};

type AsButton = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
export type ButtonProps = AsButton | AsLink;

/** A button, or a link that looks like one when given `href`. */
export function Button(props: ButtonProps) {
  const { variant = "neutral", size = "md", loading, iconStart, iconEnd, full, children, className, ...rest } = props;
  const data = {
    className: `ui-btn${className ? ` ${className}` : ""}`,
    "data-variant": variant,
    "data-size": size === "md" ? undefined : size,
    "data-full": full || undefined,
    "data-loading": loading || undefined,
  };
  const inner = (
    <>
      {loading ? <Spinner /> : iconStart}
      {children}
      {iconEnd}
    </>
  );
  if ("href" in rest && rest.href !== undefined) {
    const { href, ...anchor } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
    return (
      <Link href={href} {...anchor} {...data} aria-busy={loading || undefined}>
        {inner}
      </Link>
    );
  }
  const { type = "button", disabled, ...button } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={type} disabled={disabled} {...button} {...data} aria-busy={loading || undefined}>
      {inner}
    </button>
  );
}

/** A square button with only an icon. `label` is read out by screen readers and shown nowhere else. */
export function IconButton({ label, icon, variant = "neutral", size = "md", className, ...rest }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & { label: string; icon: ReactNode; variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      type="button"
      {...rest}
      aria-label={label}
      title={label}
      className={`ui-btn${className ? ` ${className}` : ""}`}
      data-variant={variant}
      data-size={size === "md" ? undefined : size}
      data-icon-only=""
    >
      {icon}
    </button>
  );
}
