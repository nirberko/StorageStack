export function photoUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/deal-photos/${path}`;
}
