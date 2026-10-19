-- Members can flag a deal for moderators to review. Reports are private to the reporter.

create table public.deal_reports (
  deal_id bigint not null references public.deals (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null default '',
  created_at timestamptz not null default now(),
  primary key (deal_id, user_id)
);

alter table public.deal_reports enable row level security;

create policy "own reports" on public.deal_reports for select to authenticated using (auth.uid() = user_id);
create policy "members report deals" on public.deal_reports for insert to authenticated with check (auth.uid() = user_id);
create policy "members withdraw reports" on public.deal_reports for delete to authenticated using (auth.uid() = user_id);
