-- StorageStack: community forums + deal room for self storage investors.

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  headline text not null default '',          -- "Investor · Columbus, OH"
  location text not null default '',
  bio text not null default '',
  avatar_color text not null default '#E6EBF3',
  verified boolean not null default false,
  is_moderator boolean not null default false,
  post_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are public" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

revoke update on public.profiles from anon, authenticated;
grant update (full_name, headline, location, bio) on public.profiles to authenticated;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  palette text[] := array['#FFD8BF', '#D8E6FF', '#D4F2E4', '#EADFFF', '#FBF1DD', '#FBE6F0', '#DFF4F4', '#E6EBF3'];
begin
  insert into public.profiles (id, full_name, headline, avatar_color)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'headline', ''),
    palette[1 + floor(random() * array_length(palette, 1))::int]
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Forums
-- ---------------------------------------------------------------------------

create table public.categories (
  id text primary key,
  name text not null,
  group_name text not null,
  sort integer not null default 0,
  color text not null,
  tint text not null,
  ink text not null,
  icon text not null,
  description text not null default ''
);

alter table public.categories enable row level security;
create policy "categories are public" on public.categories for select using (true);

create table public.threads (
  id bigint generated always as identity primary key,
  category_id text not null references public.categories (id),
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 8 and 200),
  body text not null check (char_length(body) between 1 and 20000),
  tags text[] not null default '{}',
  stats jsonb not null default '[]',          -- [{ "l": "Asking", "v": "$2.4M", "c": "#17603F" }]
  pinned boolean not null default false,
  solved boolean not null default false,
  views integer not null default 0,
  reply_count integer not null default 0,
  like_count integer not null default 0,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index threads_category_idx on public.threads (category_id, last_activity_at desc);
create index threads_activity_idx on public.threads (pinned desc, last_activity_at desc);
create index threads_title_trgm on public.threads using gin (title gin_trgm_ops);

alter table public.threads enable row level security;

create policy "threads are public" on public.threads for select using (true);
create policy "members start threads" on public.threads for insert to authenticated
  with check (auth.uid() = author_id);
create policy "authors edit threads" on public.threads for update to authenticated
  using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "authors delete threads" on public.threads for delete to authenticated
  using (auth.uid() = author_id);

revoke insert, update on public.threads from anon, authenticated;
grant insert (category_id, author_id, title, body, tags, stats) on public.threads to authenticated;
grant update (category_id, title, body, tags, stats) on public.threads to authenticated;

create table public.replies (
  id bigint generated always as identity primary key,
  thread_id bigint not null references public.threads (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 20000),
  is_answer boolean not null default false,
  created_at timestamptz not null default now()
);

create index replies_thread_idx on public.replies (thread_id, created_at);

alter table public.replies enable row level security;

create policy "replies are public" on public.replies for select using (true);
create policy "members reply" on public.replies for insert to authenticated
  with check (auth.uid() = author_id);
create policy "authors edit replies" on public.replies for update to authenticated
  using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "authors delete replies" on public.replies for delete to authenticated
  using (auth.uid() = author_id);

revoke insert, update on public.replies from anon, authenticated;
grant insert (thread_id, author_id, body) on public.replies to authenticated;
grant update (body) on public.replies to authenticated;

create table public.thread_likes (
  thread_id bigint not null references public.threads (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

create table public.thread_saves (
  thread_id bigint not null references public.threads (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

create table public.category_follows (
  category_id text not null references public.categories (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (category_id, user_id)
);

alter table public.thread_likes enable row level security;
alter table public.thread_saves enable row level security;
alter table public.category_follows enable row level security;

create policy "likes are public" on public.thread_likes for select using (true);
create policy "members like" on public.thread_likes for insert to authenticated with check (auth.uid() = user_id);
create policy "members unlike" on public.thread_likes for delete to authenticated using (auth.uid() = user_id);

create policy "own saves" on public.thread_saves for select to authenticated using (auth.uid() = user_id);
create policy "members save" on public.thread_saves for insert to authenticated with check (auth.uid() = user_id);
create policy "members unsave" on public.thread_saves for delete to authenticated using (auth.uid() = user_id);

create policy "own follows" on public.category_follows for select to authenticated using (auth.uid() = user_id);
create policy "members follow" on public.category_follows for insert to authenticated with check (auth.uid() = user_id);
create policy "members unfollow" on public.category_follows for delete to authenticated using (auth.uid() = user_id);

-- Counters -------------------------------------------------------------------

create function public.on_reply_change()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.threads
      set reply_count = reply_count + 1, last_activity_at = new.created_at
      where id = new.thread_id;
    update public.profiles set post_count = post_count + 1 where id = new.author_id;
  elsif tg_op = 'DELETE' then
    update public.threads set reply_count = greatest(reply_count - 1, 0) where id = old.thread_id;
    update public.profiles set post_count = greatest(post_count - 1, 0) where id = old.author_id;
    if old.is_answer then
      update public.threads set solved = false where id = old.thread_id;
    end if;
  end if;
  return null;
end;
$$;

create trigger replies_counter after insert or delete on public.replies
  for each row execute function public.on_reply_change();

create function public.on_thread_change()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles set post_count = post_count + 1 where id = new.author_id;
  elsif tg_op = 'DELETE' then
    update public.profiles set post_count = greatest(post_count - 1, 0) where id = old.author_id;
  end if;
  return null;
end;
$$;

create trigger threads_counter after insert or delete on public.threads
  for each row execute function public.on_thread_change();

create function public.on_thread_like_change()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.threads set like_count = like_count + 1 where id = new.thread_id;
  else
    update public.threads set like_count = greatest(like_count - 1, 0) where id = old.thread_id;
  end if;
  return null;
end;
$$;

create trigger thread_likes_counter after insert or delete on public.thread_likes
  for each row execute function public.on_thread_like_change();

-- RPCs -----------------------------------------------------------------------

create function public.increment_thread_views(p_thread_id bigint)
returns void
language sql
security definer set search_path = ''
as $$
  update public.threads set views = views + 1 where id = p_thread_id;
$$;

-- Only the thread author may mark (or unmark) the accepted answer.
create function public.mark_answer(p_reply_id bigint, p_is_answer boolean)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  v_thread_id bigint;
begin
  select r.thread_id into v_thread_id
  from public.replies r
  join public.threads t on t.id = r.thread_id
  where r.id = p_reply_id and t.author_id = auth.uid();

  if v_thread_id is null then
    raise exception 'Only the person who started the discussion can mark an answer';
  end if;

  update public.replies set is_answer = false where thread_id = v_thread_id;
  update public.replies set is_answer = p_is_answer where id = p_reply_id;
  update public.threads set solved = p_is_answer where id = v_thread_id;
end;
$$;

create view public.category_counts as
  select c.id as category_id, count(t.id)::int as topics
  from public.categories c
  left join public.threads t on t.category_id = c.id
  group by c.id;

-- ---------------------------------------------------------------------------
-- Deal Room
-- ---------------------------------------------------------------------------

create type public.deal_type as enum ('sale', 'equity', 'jv', 'debt');
create type public.property_type as enum ('facility', 'conv', 'land', 'rv', 'portfolio');
create type public.deal_status as enum ('live', 'closed');
create type public.deal_visibility as enum ('approve', 'verified');
create type public.request_status as enum ('pending', 'approved', 'declined');

create table public.deals (
  id bigint generated always as identity primary key,
  poster_id uuid not null references public.profiles (id) on delete cascade,
  type public.deal_type not null,
  property_type public.property_type not null,
  off_market boolean not null default false,
  status public.deal_status not null default 'live',
  visibility public.deal_visibility not null default 'approve',
  title text not null check (char_length(title) between 8 and 140),
  city text not null,
  state text not null,
  region text not null default '',            -- Southeast, Texas, Midwest...
  story text not null default '',
  amount numeric not null default 0,          -- headline dollar figure (asking, raise, loan, deal size)
  raise_goal numeric,
  raise_committed numeric,
  raise_note text not null default '',
  closes_note text not null default '',
  seek text not null default '',              -- "Looking for: ..."
  seeking text[] not null default '{}',
  needed_by text not null default '',
  features text[] not null default '{}',
  metrics jsonb not null default '[]',        -- card metrics [{l, v, c}]
  details jsonb not null default '{}',        -- optional deal page sections
  photos jsonb not null default '[]',         -- [{ "path": "...", "label": "Front" }]
  views integer not null default 0,
  interest_count integer not null default 0,
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

create index deals_feed_idx on public.deals (status, created_at desc);
create index deals_title_trgm on public.deals using gin (title gin_trgm_ops);

alter table public.deals enable row level security;

create policy "live deals are public" on public.deals for select
  using (status = 'live' or auth.uid() = poster_id);
create policy "members post deals" on public.deals for insert to authenticated
  with check (auth.uid() = poster_id);
create policy "posters edit deals" on public.deals for update to authenticated
  using (auth.uid() = poster_id) with check (auth.uid() = poster_id);
create policy "posters delete deals" on public.deals for delete to authenticated
  using (auth.uid() = poster_id);

revoke insert, update on public.deals from anon, authenticated;
grant insert (poster_id, type, property_type, off_market, visibility, title, city, state, region, story,
  amount, raise_goal, raise_committed, raise_note, closes_note, seek, seeking, needed_by, features,
  metrics, details, photos) on public.deals to authenticated;
grant update (off_market, status, visibility, title, city, state, region, story, amount, raise_goal,
  raise_committed, raise_note, closes_note, seek, seeking, needed_by, features, metrics, details, photos,
  closed_at) on public.deals to authenticated;

create table public.deal_requests (
  deal_id bigint not null references public.deals (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  message text not null default '',
  amount numeric,
  status public.request_status not null default 'pending',
  created_at timestamptz not null default now(),
  primary key (deal_id, user_id)
);

alter table public.deal_requests enable row level security;

create policy "requesters and posters see requests" on public.deal_requests for select to authenticated
  using (
    auth.uid() = user_id
    or exists (select 1 from public.deals d where d.id = deal_id and d.poster_id = auth.uid())
  );
create policy "members request" on public.deal_requests for insert to authenticated
  with check (auth.uid() = user_id);
create policy "members withdraw" on public.deal_requests for delete to authenticated
  using (auth.uid() = user_id);
create policy "posters decide" on public.deal_requests for update to authenticated
  using (exists (select 1 from public.deals d where d.id = deal_id and d.poster_id = auth.uid()));

revoke insert, update on public.deal_requests from anon, authenticated;
grant insert (deal_id, user_id, message, amount) on public.deal_requests to authenticated;
grant update (status) on public.deal_requests to authenticated;

create function public.on_deal_request_change()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.deals set interest_count = interest_count + 1 where id = new.deal_id;
  else
    update public.deals set interest_count = greatest(interest_count - 1, 0) where id = old.deal_id;
  end if;
  return null;
end;
$$;

create trigger deal_requests_counter after insert or delete on public.deal_requests
  for each row execute function public.on_deal_request_change();

-- Can the current user see a deal's private details (address, documents)?
create function public.can_see_private(p_deal_id bigint)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.deals d
    where d.id = p_deal_id
      and (
        d.poster_id = auth.uid()
        or exists (
          select 1 from public.deal_requests r
          where r.deal_id = d.id and r.user_id = auth.uid() and r.status = 'approved'
        )
        or (
          d.visibility = 'verified'
          and exists (select 1 from public.profiles p where p.id = auth.uid() and p.verified)
        )
      )
  );
$$;

create table public.deal_private (
  deal_id bigint primary key references public.deals (id) on delete cascade,
  address text not null default ''
);

alter table public.deal_private enable row level security;

create policy "approved members see private details" on public.deal_private for select to authenticated
  using (public.can_see_private(deal_id));
create policy "posters write private details" on public.deal_private for insert to authenticated
  with check (exists (select 1 from public.deals d where d.id = deal_id and d.poster_id = auth.uid()));
create policy "posters update private details" on public.deal_private for update to authenticated
  using (exists (select 1 from public.deals d where d.id = deal_id and d.poster_id = auth.uid()));

create table public.deal_documents (
  id bigint generated always as identity primary key,
  deal_id bigint not null references public.deals (id) on delete cascade,
  name text not null,
  ext text not null default 'PDF',
  meta text not null default '',
  storage_path text,
  created_at timestamptz not null default now()
);

alter table public.deal_documents enable row level security;

-- Everyone can see which documents exist; the files themselves are protected by storage policies.
create policy "document list is public" on public.deal_documents for select using (true);
create policy "posters add documents" on public.deal_documents for insert to authenticated
  with check (exists (select 1 from public.deals d where d.id = deal_id and d.poster_id = auth.uid()));
create policy "posters remove documents" on public.deal_documents for delete to authenticated
  using (exists (select 1 from public.deals d where d.id = deal_id and d.poster_id = auth.uid()));

create table public.deal_saves (
  deal_id bigint not null references public.deals (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (deal_id, user_id)
);

alter table public.deal_saves enable row level security;
create policy "own deal saves" on public.deal_saves for select to authenticated using (auth.uid() = user_id);
create policy "members save deals" on public.deal_saves for insert to authenticated with check (auth.uid() = user_id);
create policy "members unsave deals" on public.deal_saves for delete to authenticated using (auth.uid() = user_id);

create table public.deal_questions (
  id bigint generated always as identity primary key,
  deal_id bigint not null references public.deals (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 3 and 4000),
  answer text,
  answered_at timestamptz,
  like_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.deal_questions enable row level security;

create policy "questions are public" on public.deal_questions for select using (true);
create policy "members ask" on public.deal_questions for insert to authenticated
  with check (auth.uid() = author_id);
create policy "askers delete questions" on public.deal_questions for delete to authenticated
  using (auth.uid() = author_id);
create policy "posters answer" on public.deal_questions for update to authenticated
  using (exists (select 1 from public.deals d where d.id = deal_id and d.poster_id = auth.uid()));

revoke insert, update on public.deal_questions from anon, authenticated;
grant insert (deal_id, author_id, body) on public.deal_questions to authenticated;
grant update (answer, answered_at) on public.deal_questions to authenticated;

create table public.question_likes (
  question_id bigint not null references public.deal_questions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  primary key (question_id, user_id)
);

alter table public.question_likes enable row level security;
create policy "question likes are public" on public.question_likes for select using (true);
create policy "members like questions" on public.question_likes for insert to authenticated with check (auth.uid() = user_id);
create policy "members unlike questions" on public.question_likes for delete to authenticated using (auth.uid() = user_id);

create function public.on_question_like_change()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.deal_questions set like_count = like_count + 1 where id = new.question_id;
  else
    update public.deal_questions set like_count = greatest(like_count - 1, 0) where id = old.question_id;
  end if;
  return null;
end;
$$;

create trigger question_likes_counter after insert or delete on public.question_likes
  for each row execute function public.on_question_like_change();

create function public.increment_deal_views(p_deal_id bigint)
returns void
language sql
security definer set search_path = ''
as $$
  update public.deals set views = views + 1 where id = p_deal_id;
$$;

-- Capital partners: investors, lenders and operators looking for deals ----------

create table public.capital_partners (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('Investor', 'Lender', 'Operator', 'Family office')),
  offer_label text not null default 'Invests',
  offer text not null,
  about text not null default '',
  focus text[] not null default '{}',
  track_record text not null default '',
  reply_time text not null default 'Usually replies within a day',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.capital_partners enable row level security;
create policy "partners are public" on public.capital_partners for select using (true);
create policy "members become partners" on public.capital_partners for insert to authenticated
  with check (auth.uid() = profile_id);
create policy "partners edit themselves" on public.capital_partners for update to authenticated
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "partners leave" on public.capital_partners for delete to authenticated
  using (auth.uid() = profile_id);

create table public.partner_connections (
  partner_id uuid not null references public.capital_partners (profile_id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (partner_id, user_id)
);

alter table public.partner_connections enable row level security;
create policy "both sides see connections" on public.partner_connections for select to authenticated
  using (auth.uid() = user_id or auth.uid() = partner_id);
create policy "members connect" on public.partner_connections for insert to authenticated
  with check (auth.uid() = user_id);
create policy "members disconnect" on public.partner_connections for delete to authenticated
  using (auth.uid() = user_id);

create table public.deal_alerts (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null,
  deal_type public.deal_type,
  property_type public.property_type,
  region text,
  max_amount numeric,
  created_at timestamptz not null default now()
);

alter table public.deal_alerts enable row level security;
create policy "own alerts" on public.deal_alerts for select to authenticated using (auth.uid() = user_id);
create policy "members add alerts" on public.deal_alerts for insert to authenticated with check (auth.uid() = user_id);
create policy "members remove alerts" on public.deal_alerts for delete to authenticated using (auth.uid() = user_id);

create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followee_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

alter table public.follows enable row level security;
create policy "follows are public" on public.follows for select using (true);
create policy "members follow people" on public.follows for insert to authenticated with check (auth.uid() = follower_id);
create policy "members unfollow people" on public.follows for delete to authenticated using (auth.uid() = follower_id);

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------

create table public.events (
  id bigint generated always as identity primary key,
  title text not null,
  host_id uuid references public.profiles (id) on delete set null,
  starts_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.event_reminders (
  event_id bigint not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  primary key (event_id, user_id)
);

alter table public.events enable row level security;
alter table public.event_reminders enable row level security;
create policy "events are public" on public.events for select using (true);
create policy "reminders are countable" on public.event_reminders for select using (true);
create policy "members set reminders" on public.event_reminders for insert to authenticated with check (auth.uid() = user_id);
create policy "members clear reminders" on public.event_reminders for delete to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Stats
-- ---------------------------------------------------------------------------

create function public.community_stats()
returns json
language sql
stable
security definer set search_path = ''
as $$
  select json_build_object(
    'members', (select count(*) from public.profiles),
    'discussions', (select count(*) from public.threads),
    'active_this_week', (
      select count(distinct author_id) from (
        select author_id from public.threads where created_at > now() - interval '7 days'
        union all
        select author_id from public.replies where created_at > now() - interval '7 days'
      ) a
    )
  );
$$;

create function public.deal_room_stats()
returns json
language sql
stable
security definer set search_path = ''
as $$
  select json_build_object(
    'active', (select count(*) from public.deals where status = 'live'),
    'total_value', (select coalesce(sum(amount), 0) from public.deals where status = 'live'),
    'partners', (select count(*) from public.capital_partners where active),
    'closed_this_year', (
      select count(*) from public.deals
      where status = 'closed' and closed_at >= date_trunc('year', now())
    ),
    'new_this_week', (select count(*) from public.deals where created_at > now() - interval '7 days')
  );
$$;

-- ---------------------------------------------------------------------------
-- Storage: public deal photos, private deal documents
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public) values ('deal-photos', 'deal-photos', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('deal-docs', 'deal-docs', false)
  on conflict (id) do nothing;

-- Files live under "<user id>/..." so members can only write into their own folder.
create policy "members upload deal photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'deal-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "members delete own deal photos" on storage.objects for delete to authenticated
  using (bucket_id = 'deal-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "members upload deal docs" on storage.objects for insert to authenticated
  with check (bucket_id = 'deal-docs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "members delete own deal docs" on storage.objects for delete to authenticated
  using (bucket_id = 'deal-docs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "approved members read deal docs" on storage.objects for select to authenticated
  using (
    bucket_id = 'deal-docs'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.deal_documents doc
        where doc.storage_path = name and public.can_see_private(doc.deal_id)
      )
    )
  );
