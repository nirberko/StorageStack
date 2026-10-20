export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function timeAgo(date: string | Date, now = new Date()): string {
  const then = typeof date === "string" ? new Date(date) : date;
  const s = Math.max(0, Math.round((now.getTime() - then.getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.round(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.round(mo / 12)}y ago`;
}

/** 21400 -> "21k", 1240 -> "1.2k" */
export function compact(n: number): string {
  if (n < 1000) return String(n);
  return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".0", "") + "k";
}

export function count(n: number): string {
  return n.toLocaleString("en-US");
}

/** Dollars -> "$2.4M" / "$750k" */
export function money(dollars: number): string {
  if (dollars >= 1_000_000) return "$" + Math.round(dollars / 10_000) / 100 + "M";
  if (dollars >= 1000) return "$" + Math.round(dollars / 1000) + "k";
  return "$" + Math.round(dollars);
}

/** Hour of the day (0–23) -> "morning" / "afternoon" / "evening". */
export function partOfDay(hour: number): string {
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export function plural(n: number, one: string, many = one + "s"): string {
  return `${count(n)} ${n === 1 ? one : many}`;
}
