"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children, pendingText, className = "m-btn m-btn-o", style }: { children: React.ReactNode; pendingText?: string; className?: string; style?: React.CSSProperties }) {
  const { pending } = useFormStatus();
  return (
    <button className={className} type="submit" disabled={pending} style={style}>
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
