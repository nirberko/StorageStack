-- Admin panel: admins manage members and forum topics.
-- Make the first admin from the SQL editor:
--   update public.profiles set is_admin = true where id = (select id from auth.users where email = 'you@example.com');

-- Not in the profiles update grant, so members cannot make themselves admins.
alter table public.profiles add column is_admin boolean not null default false;

create function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false);
$$;

create function public.assert_admin()
returns void
language plpgsql
stable
security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can do that' using errcode = '42501';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Topics (forum categories)
-- ---------------------------------------------------------------------------

create policy "admins add topics" on public.categories for insert to authenticated
  with check (public.is_admin());
create policy "admins edit topics" on public.categories for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Topic ids appear in links, so they cannot change. Deleting goes through admin_delete_category.
revoke insert, update, delete on public.categories from anon, authenticated;
grant insert (id, name, group_name, sort, color, tint, ink, icon, description) on public.categories to authenticated;
grant update (name, group_name, sort, color, tint, ink, icon, description) on public.categories to authenticated;

-- Delete a topic, first moving its discussions to p_move_to (required if it has any).
create function public.admin_delete_category(p_id text, p_move_to text default null)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  perform public.assert_admin();

  if p_move_to is not null then
    if p_move_to = p_id then
      raise exception 'Pick a different topic to move the discussions to';
    end if;
    if not exists (select 1 from public.categories c where c.id = p_move_to) then
      raise exception 'That topic no longer exists';
    end if;
    update public.threads set category_id = p_move_to where category_id = p_id;
  elsif exists (select 1 from public.threads t where t.category_id = p_id) then
    raise exception 'This topic still has discussions. Pick a topic to move them to.';
  end if;

  delete from public.categories where id = p_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Members
-- ---------------------------------------------------------------------------

-- Members with their email and sign-in details, newest first. p_filter: all, admins, moderators,
-- verified, unverified, suspended.
create function public.admin_members(p_query text default '', p_filter text default 'all', p_limit int default 25, p_offset int default 0)
returns table (
  id uuid,
  full_name text,
  headline text,
  avatar_color text,
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
    select p.id, p.full_name, p.headline, p.avatar_color, u.email::text, p.verified, p.is_moderator, p.is_admin,
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

-- Change a member's roles. Null leaves a field as it is.
create function public.admin_update_member(
  p_user_id uuid, p_verified boolean default null, p_is_moderator boolean default null, p_is_admin boolean default null
)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  perform public.assert_admin();

  if p_user_id = auth.uid() and p_is_admin = false then
    raise exception 'You cannot remove your own admin access';
  end if;

  update public.profiles
    set verified = coalesce(p_verified, verified),
        is_moderator = coalesce(p_is_moderator, is_moderator),
        is_admin = coalesce(p_is_admin, is_admin)
    where id = p_user_id;
  if not found then
    raise exception 'Member not found';
  end if;
end;
$$;

-- Suspended members cannot log in, and their sessions are signed out.
create function public.admin_set_suspended(p_user_id uuid, p_suspended boolean)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  perform public.assert_admin();

  if p_user_id = auth.uid() then
    raise exception 'You cannot suspend yourself';
  end if;
  if p_suspended and exists (select 1 from public.profiles p where p.id = p_user_id and p.is_admin) then
    raise exception 'Remove their admin access before suspending them';
  end if;

  update auth.users
    set banned_until = case when p_suspended then now() + interval '100 years' end
    where id = p_user_id;
  if not found then
    raise exception 'Member not found';
  end if;

  if p_suspended then
    delete from auth.sessions where user_id = p_user_id;
  end if;
end;
$$;

-- Deletes the account and everything the member posted.
create function public.admin_delete_member(p_user_id uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  perform public.assert_admin();

  if p_user_id = auth.uid() then
    raise exception 'You cannot delete your own account here';
  end if;
  if exists (select 1 from public.profiles p where p.id = p_user_id and p.is_admin) then
    raise exception 'Remove their admin access before deleting them';
  end if;

  delete from auth.users where id = p_user_id;
  if not found then
    raise exception 'Member not found';
  end if;
end;
$$;

revoke execute on function public.assert_admin(), public.admin_delete_category(text, text),
  public.admin_members(text, text, int, int), public.admin_update_member(uuid, boolean, boolean, boolean),
  public.admin_set_suspended(uuid, boolean), public.admin_delete_member(uuid)
  from public, anon;
grant execute on function public.assert_admin(), public.admin_delete_category(text, text),
  public.admin_members(text, text, int, int), public.admin_update_member(uuid, boolean, boolean, boolean),
  public.admin_set_suspended(uuid, boolean), public.admin_delete_member(uuid)
  to authenticated;
