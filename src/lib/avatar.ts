/** Storage bucket that holds profile photos, one folder per member. */
export const AVATAR_BUCKET = "avatars";

/** Largest file members can pick before we resize it in the browser. */
export const AVATAR_MAX_PICK_BYTES = 15 * 1024 * 1024;

/** Side of the square photo we store, in pixels. */
export const AVATAR_SIZE = 512;

/** Public URL of a profile photo, or null when the member has none. */
export function avatarUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${AVATAR_BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

/** True when the path is a photo in this member's own folder (mirrors the database check). */
export function isOwnAvatarPath(userId: string, path: string): boolean {
  return new RegExp(`^${userId}/[A-Za-z0-9_-]{1,64}\\.(webp|jpg|png)$`).test(path);
}
