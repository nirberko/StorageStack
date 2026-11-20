import { ICONS } from "@/lib/icons";

export const AVATAR_COLORS = ["#FFD8BF", "#D8E6FF", "#D4F2E4", "#EADFFF", "#FBF1DD", "#FBE6F0", "#DFF4F4", "#E6EBF3"];

// Forum topics -----------------------------------------------------------------

/** Sidebar sections that forum topics are grouped under, in display order. */
export const TOPIC_GROUPS = ["Start here", "Buy & build", "Operate", "Money & legal"];

/** Topic color sets: icon color, chip background and dark text. */
export const TOPIC_COLORS = [
  { name: "Blue", color: "#2563EB", tint: "#E6EEFD", ink: "#1D4ED8" },
  { name: "Teal", color: "#0E8A8A", tint: "#DFF4F4", ink: "#0B6B6B" },
  { name: "Orange", color: "#DB520B", tint: "#FFEDE2", ink: "#B5440A" },
  { name: "Gold", color: "#B7791F", tint: "#FBF1DD", ink: "#8A5A12" },
  { name: "Pink", color: "#C0397A", tint: "#FBE6F0", ink: "#9A2C62" },
  { name: "Green", color: "#16855A", tint: "#DDF3E8", ink: "#17603F" },
  { name: "Purple", color: "#7C4DDB", tint: "#EFE8FD", ink: "#5B33B0" },
  { name: "Red", color: "#D23B3B", tint: "#FCE5E5", ink: "#A82A2A" },
  { name: "Navy", color: "#0B1F3A", tint: "#E6EBF3", ink: "#0B1F3A" },
  { name: "Brown", color: "#6B5A45", tint: "#F1ECE5", ink: "#55462F" },
  { name: "Indigo", color: "#3D55A3", tint: "#E7EBF8", ink: "#2F4486" },
];

export const TOPIC_ICONS = [
  { name: "Sprout", d: "M12 20v-8M12 12c0-4 3-6 7-6 0 4-3 6-7 6zM12 14c0-3-2-5-6-5 0 3 2 5 6 5" },
  { name: "Chart", d: ICONS.chart },
  { name: "Search", d: "M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4" },
  { name: "Building", d: ICONS.build },
  { name: "Convert", d: "M4 12a8 8 0 0114-5l2 2M20 12a8 8 0 01-14 5l-2-2M20 4v5h-5M4 20v-5h5" },
  { name: "Lock", d: ICONS.lock },
  { name: "Price tag", d: "M3 12V4h8l10 10-8 8zM7.5 7.5h.01" },
  { name: "Megaphone", d: "M3 11v2a1 1 0 001 1h3l5 4V6L7 10H4a1 1 0 00-1 1zM16 9a4 4 0 010 6" },
  { name: "Trailer", d: "M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 100-4 2 2 0 000 4zM17 19a2 2 0 100-4 2 2 0 000 4z" },
  { name: "Money", d: ICONS.money },
  { name: "Shield", d: ICONS.shield },
  { name: "Exit", d: ICONS.exit },
  { name: "Chat", d: ICONS.chat },
  { name: "Idea", d: ICONS.bulb },
  { name: "People", d: ICONS.people },
  { name: "Briefcase", d: ICONS.briefcase },
  { name: "Coin", d: ICONS.coin },
  { name: "Trend", d: ICONS.trend },
  { name: "Document", d: ICONS.file },
  { name: "Calendar", d: ICONS.calendar },
  { name: "Screen", d: ICONS.screen },
  { name: "Camera", d: ICONS.camera },
  { name: "Map pin", d: ICONS.pin },
  { name: "Bell", d: ICONS.bell },
];
