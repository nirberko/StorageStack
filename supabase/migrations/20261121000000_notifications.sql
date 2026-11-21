-- Notifications: tell members when someone replies to their discussion, replies in a discussion they
-- joined, likes their discussion, marks their reply as the answer, or follows them.
--
-- Rows are written only by the triggers below (security definer). Members can read their own
-- notifications, mark them read and delete them, but cannot create them.
--
-- While a notification is unread, more activity of the same kind on the same discussion is folded
-- into it (count goes up, the latest actor and time are shown) instead of adding a new row.

create table public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('reply', 'thread_reply', 'like', 'answer', 'follow')),
  thread_id bigint references public.threads (id) on delete cascade,
  reply_id bigint references public.replies (id) on delete set null,
  count integer not null default 1,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, created_at desc);
create index notifications_unread_idx on public.notifications (user_id, kind, thread_id) where read_at is null;

alter table public.notifications enable row level security;

create policy "members see own notifications" on public.notifications for select to authenticated
  using (auth.uid() = user_id);
create policy "members mark own notifications read" on public.notifications for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "members clear own notifications" on public.notifications for delete to authenticated
  using (auth.uid() = user_id);

revoke insert, update on public.notifications from anon, authenticated;
grant update (read_at) on public.notifications to authenticated;

-- Add a notification, or fold it into an unread one of the same kind for the same discussion.
create function public.notify(
  p_user_id uuid, p_actor_id uuid, p_kind text, p_thread_id bigint default null, p_reply_id bigint default null
)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if p_user_id is null or p_user_id = p_actor_id then
    return;
  end if;

  update public.notifications
    set actor_id = p_actor_id, reply_id = coalesce(p_reply_id, reply_id), count = count + 1, created_at = now()
    where user_id = p_user_id and kind = p_kind and read_at is null
      and thread_id is not distinct from p_thread_id
      and p_kind in ('reply', 'thread_reply', 'like');
  if found then
    return;
  end if;

  insert into public.notifications (user_id, actor_id, kind, thread_id, reply_id)
  values (p_user_id, p_actor_id, p_kind, p_thread_id, p_reply_id);
end;
$$;

revoke execute on function public.notify(uuid, uuid, text, bigint, bigint) from public, anon, authenticated;

-- Replies: the discussion's author, and everyone else who has replied in it.
create function public.notify_on_reply()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_author uuid;
  v_participant uuid;
begin
  select t.author_id into v_author from public.threads t where t.id = new.thread_id;
  perform public.notify(v_author, new.author_id, 'reply', new.thread_id, new.id);

  for v_participant in
    select distinct r.author_id from public.replies r
    where r.thread_id = new.thread_id and r.id <> new.id
      and r.author_id <> new.author_id and r.author_id is distinct from v_author
  loop
    perform public.notify(v_participant, new.author_id, 'thread_reply', new.thread_id, new.id);
  end loop;
  return null;
end;
$$;

create trigger replies_notify after insert on public.replies
  for each row execute function public.notify_on_reply();

-- Likes on a discussion. Unliking and liking again does not notify twice.
create function public.notify_on_thread_like()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_author uuid;
begin
  select t.author_id into v_author from public.threads t where t.id = new.thread_id;
  if exists (
    select 1 from public.notifications n
    where n.user_id = v_author and n.actor_id = new.user_id and n.kind = 'like' and n.thread_id = new.thread_id
  ) then
    return null;
  end if;
  perform public.notify(v_author, new.user_id, 'like', new.thread_id);
  return null;
end;
$$;

create trigger thread_likes_notify after insert on public.thread_likes
  for each row execute function public.notify_on_thread_like();

-- A reply marked as the answer (only the discussion's author can do that, see mark_answer).
create function public.notify_on_answer()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_author uuid;
begin
  if new.is_answer and not old.is_answer then
    select t.author_id into v_author from public.threads t where t.id = new.thread_id;
    if not exists (
      select 1 from public.notifications n
      where n.user_id = new.author_id and n.kind = 'answer' and n.reply_id = new.id
    ) then
      perform public.notify(new.author_id, v_author, 'answer', new.thread_id, new.id);
    end if;
  end if;
  return null;
end;
$$;

create trigger replies_answer_notify after update of is_answer on public.replies
  for each row execute function public.notify_on_answer();

-- New followers. Unfollowing and following again does not notify twice.
create function public.notify_on_follow()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.notifications n
    where n.user_id = new.followee_id and n.actor_id = new.follower_id and n.kind = 'follow'
  ) then
    perform public.notify(new.followee_id, new.follower_id, 'follow');
  end if;
  return null;
end;
$$;

create trigger follows_notify after insert on public.follows
  for each row execute function public.notify_on_follow();

-- Push new notifications to the header bell as they happen (Supabase Realtime respects RLS).
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;
