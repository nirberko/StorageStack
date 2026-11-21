-- Profile photos. Members upload a square photo to the public 'avatars' bucket under a folder named
-- after their user id, then point profiles.avatar_path at it. Members without a photo keep the
-- colored initials (avatar_color).

alter table public.profiles add column avatar_path text;

-- Only paths in the member's own folder, so a profile cannot point at someone else's photo.
alter table public.profiles add constraint profiles_avatar_path_own_folder
  check (avatar_path is null or avatar_path ~ ('^' || id::text || '/[A-Za-z0-9_-]{1,64}\.(webp|jpg|png)$'));

grant update (avatar_path) on public.profiles to authenticated;

-- Bucket: public read, 2 MB, images only. --------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies: members manage files in their own folder only. ---------------
create policy "members upload own avatar" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "members update own avatar" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "members delete own avatar" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Admin member list shows photos too. -------------------------------------------
drop function public.admin_members(text, text, int, int);
-- Members with their email and sign-in details, newest first. p_filter: all, admins, moderators,
-- verified, unverified, suspended.
create function public.admin_members(p_query text default '', p_filter text default 'all', p_limit int default 25, p_offset int default 0)
returns table (
  id uuid,
  full_name text,
  headline text,
  avatar_color text,
  avatar_path text,
  email text,
  verified boolean,
  is_moderator boolean,
  is_admin boolean,
  post_count integer,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  suspended boolean,
  total bigint
)
language plpgsql
stable
security definer set search_path = ''
as $$
declare
  v_like text := '%' || replace(replace(replace(coalesce(p_query, ''), '\', '\\'), '%', '\%'), '_', '\_') || '%';
begin
  perform public.assert_admin();

  return query
    select p.id, p.full_name, p.headline, p.avatar_color, p.avatar_path, u.email::text, p.verified, p.is_moderator, p.is_admin,
      p.post_count, p.created_at, u.last_sign_in_at, coalesce(u.banned_until > now(), false), count(*) over ()
    from public.profiles p
    join auth.users u on u.id = p.id
    where (coalesce(p_query, '') = '' or p.full_name ilike v_like or u.email ilike v_like or p.headline ilike v_like)
      and case p_filter
        when 'admins' then p.is_admin
        when 'moderators' then p.is_moderator
        when 'verified' then p.verified
        when 'unverified' then not p.verified
        when 'suspended' then coalesce(u.banned_until > now(), false)
        else true
      end
    order by p.created_at desc, p.id
    limit least(greatest(p_limit, 1), 100) offset greatest(p_offset, 0);
end;
$$;

revoke execute on function public.admin_members(text, text, int, int) from public, anon;
grant execute on function public.admin_members(text, text, int, int) to authenticated;
