import type { DealType, PropertyType } from "@/lib/types";
import { ICONS } from "@/lib/icons";

export type DealTypeInfo = {
  id: DealType;
  name: string;        // pill label, e.g. "For sale"
  label: string;       // wizard label, e.g. "Selling a facility"
  ink: string;
  dot: string;
  tint: string;
  req: string;         // call to action on cards
  icon: string;
  hint: string;
  example: string;
  seek: string;        // default "who are you looking for"
  amountLabel: string; // what deals.amount means for this type
  blurb: string;       // Deal Room tab subheading
};

export const DEAL_TYPES: Record<DealType, DealTypeInfo> = {
  sale: {
    id: "sale", name: "For sale", label: "Selling a facility", ink: "#B5440A", dot: "#DB520B", tint: "#FFEDE2",
    req: "Request info", icon: "M3 12V4h8l10 10-8 8zM7.5 7.5h.01", hint: "An existing facility, land or a portfolio.",
    example: "e.g. Owner retiring, 38k sq ft in Ohio", seek: "buyers", amountLabel: "Asking price",
    blurb: "Facilities, land and portfolios — many of them off-market.",
  },
  equity: {
    id: "equity", name: "Raising money", label: "Raising money", ink: "#17603F", dot: "#16855A", tint: "#DDF3E8",
    req: "I'm interested", icon: ICONS.trend, hint: "Bring in investors for a purchase or project.",
    example: "e.g. $1.6M for a value-add in Alabama", seek: "investors", amountLabel: "Raising from investors",
    blurb: "Sponsors looking for investors. Check the track record before you commit.",
  },
  jv: {
    id: "jv", name: "Partner wanted", label: "Looking for a partner", ink: "#5B33B0", dot: "#7C4DDB", tint: "#EFE8FD",
    req: "Introduce myself", icon: "M9 11a4 4 0 100-8 4 4 0 000 8zM2 21v-1a6 6 0 0112 0v1M16 3.5a4 4 0 010 7.5M22 21v-1a6 6 0 00-4-5.6",
    hint: "Someone with experience, cash or a strong balance sheet.", example: "e.g. Land under contract, need an operator",
    seek: "operator", amountLabel: "Total deal size",
    blurb: "Members who need experience, cash or someone to sign the loan.",
  },
  debt: {
    id: "debt", name: "Needs a loan", label: "Need a loan", ink: "#1D4ED8", dot: "#2563EB", tint: "#E6EEFD",
    req: "Offer a loan", icon: "M3 10l9-6 9 6M5 10v8M10 10v8M14 10v8M19 10v8M3 21h18",
    hint: "Bridge, construction or refinance.", example: "e.g. $1.2M bridge loan in Texas", seek: "lender",
    amountLabel: "Loan amount", blurb: "Borrowers looking for banks and private lenders.",
  },
};

export const DEAL_TYPE_IDS: DealType[] = ["sale", "equity", "jv", "debt"];

export type PropertyTypeInfo = { id: PropertyType; name: string; color: string; tint: string; icon: string };

export const PROPERTY_TYPES: PropertyTypeInfo[] = [
  { id: "facility", name: "Existing facility", color: "#DB520B", tint: "#FFEDE2", icon: "M3 21V9l9-5 9 5v12M7 21v-7h10v7M7 17h10" },
  { id: "conv", name: "Conversion", color: "#C0397A", tint: "#FBE6F0", icon: "M4 12a8 8 0 0114-5l2 2M20 12a8 8 0 01-14 5l-2-2M20 4v5h-5M4 20v-5h5" },
  { id: "land", name: "Land & ground-up", color: "#B7791F", tint: "#FBF1DD", icon: "M3 20l6-10 4 6 3-4 5 8zM15 4v6M15 4l4 1.5-4 1.5" },
  { id: "rv", name: "Boat & RV", color: "#0E8A8A", tint: "#DFF4F4", icon: "M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 100-4 2 2 0 000 4zM17 19a2 2 0 100-4 2 2 0 000 4z" },
  { id: "portfolio", name: "Portfolio", color: "#3D55A3", tint: "#E7EBF8", icon: "M3 21V11l5-3 5 3v10M13 21V8l4-3 4 3v13M3 21h18" },
];

export const PROPERTY_BY_ID = Object.fromEntries(PROPERTY_TYPES.map((p) => [p.id, p])) as Record<PropertyType, PropertyTypeInfo>;

export const DEAL_SIZES = [
  { id: "any", label: "Any" },
  { id: "s", label: "Under $1M", max: 1_000_000 },
  { id: "m", label: "$1M – $5M", min: 1_000_000, max: 5_000_000 },
  { id: "l", label: "$5M+", min: 5_000_000 },
] as const;

export const REGIONS = ["Southeast", "Texas", "Midwest", "Mountain West", "Northeast", "West Coast"];

export const FEATURES = [
  { id: "climate", label: "Climate-controlled" },
  { id: "gated", label: "Gated access" },
  { id: "cameras", label: "Cameras" },
  { id: "office", label: "Office on site" },
  { id: "online", label: "Online rentals" },
  { id: "rvpark", label: "Boat & RV parking" },
  { id: "truck", label: "Truck rental" },
  { id: "expand", label: "Room to expand" },
];

export const SEEK_OPTIONS = [
  { id: "buyers", label: "Buyers" },
  { id: "investors", label: "Investors" },
  { id: "lender", label: "A lender" },
  { id: "operator", label: "An operating partner" },
  { id: "cosigner", label: "A loan co-signer" },
  { id: "broker", label: "A broker" },
];

export const PARTNER_KINDS: Record<string, { tint: string; ink: string }> = {
  Investor: { tint: "#DDF3E8", ink: "#17603F" },
  Lender: { tint: "#E6EEFD", ink: "#1D4ED8" },
  Operator: { tint: "#EFE8FD", ink: "#5B33B0" },
  "Family office": { tint: "#FFEDE2", ink: "#B5440A" },
};

export const AVATAR_COLORS = ["#FFD8BF", "#D8E6FF", "#D4F2E4", "#EADFFF", "#FBF1DD", "#FBE6F0", "#DFF4F4", "#E6EBF3"];
