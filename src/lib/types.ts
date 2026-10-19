import type { Database } from "@/lib/database.types";

type Tables = Database["public"]["Tables"];

export type Profile = Tables["profiles"]["Row"];
export type Category = Tables["categories"]["Row"];
export type Thread = Tables["threads"]["Row"];
export type Reply = Tables["replies"]["Row"];
export type Deal = Tables["deals"]["Row"];
export type DealQuestion = Tables["deal_questions"]["Row"];
export type DealDocument = Tables["deal_documents"]["Row"];
export type CapitalPartner = Tables["capital_partners"]["Row"];
export type DealType = Database["public"]["Enums"]["deal_type"];
export type PropertyType = Database["public"]["Enums"]["property_type"];

/** Author fields embedded alongside threads, replies and deals. */
export type Author = Pick<Profile, "id" | "full_name" | "headline" | "avatar_color" | "verified">;
export const AUTHOR_FIELDS = "id, full_name, headline, avatar_color, verified";

/** A small key figure: label, value and an optional value color. */
export type Metric = { l: string; v: string; c?: string };

export type DealPhoto = { path: string; label: string };

/** Optional sections of the deal page, stored in deals.details. */
export type DealDetails = {
  key_stats?: (Metric & { after?: string })[];
  tags?: string[];
  plan?: { title: string; when: string; icon: string; text: string }[];
  numbers?: { label: string; today: string; after: string; neutral?: boolean; highlight?: boolean }[];
  capital_stack?: { total: string; parts: { label: string; amount: string; pct: number; note: string; color: string }[] };
  scenarios?: { id: string; label: string; rate: string; mult: number }[];
  min_investment?: number; // in $k
  hold_years?: number;
  market?: Metric[];
  competitors?: { name: string; distance: string; rent: string; occupancy: string; self?: boolean }[];
  sponsor_stats?: Metric[];
  size?: { label: string; value: string; suffix: string }[];
  numbers_input?: { label: string; value: string }[];
};
