import type { Database } from "@/lib/database.types";

type Tables = Database["public"]["Tables"];

export type Profile = Tables["profiles"]["Row"];
export type Category = Tables["categories"]["Row"];
export type Thread = Tables["threads"]["Row"];
export type Reply = Tables["replies"]["Row"];

/** Author fields embedded alongside threads and replies. */
export type Author = Pick<Profile, "id" | "full_name" | "headline" | "avatar_color" | "avatar_path" | "verified">;
export const AUTHOR_FIELDS = "id, full_name, headline, avatar_color, avatar_path, verified";

/** A small key figure: label, value and an optional value color. */
export type Metric = { l: string; v: string; c?: string };
