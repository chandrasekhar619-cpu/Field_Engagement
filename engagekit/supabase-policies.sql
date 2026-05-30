-- EngageKit RLS Policies
-- Run this in the Supabase SQL Editor after enabling RLS on each table.

-- ─── whitelist ────────────────────────────────────────────────────────────────
alter table whitelist enable row level security;

create policy "whitelist: public read"
  on whitelist for select
  using (true);

-- ─── users ────────────────────────────────────────────────────────────────────
alter table users enable row level security;

create policy "users: public read"
  on users for select
  using (true);

create policy "users: public insert"
  on users for insert
  with check (true);

-- ─── customers ────────────────────────────────────────────────────────────────
alter table customers enable row level security;

create policy "customers: public read"
  on customers for select
  using (true);

create policy "customers: public insert"
  on customers for insert
  with check (true);

-- ─── links ────────────────────────────────────────────────────────────────────
alter table links enable row level security;

create policy "links: public read"
  on links for select
  using (true);

create policy "links: public insert"
  on links for insert
  with check (true);

-- ─── interactions ─────────────────────────────────────────────────────────────
alter table interactions enable row level security;

create policy "interactions: public read"
  on interactions for select
  using (true);

create policy "interactions: public insert"
  on interactions for insert
  with check (true);

-- ─── feedback ─────────────────────────────────────────────────────────────────
alter table feedback enable row level security;

create policy "feedback: public read"
  on feedback for select
  using (true);

create policy "feedback: public insert"
  on feedback for insert
  with check (true);
