-- EngageKit Migration v3 — enhanced data capture
-- Run this in the Supabase SQL Editor

-- ─── links: RPM context at link-creation time ─────────────────────────────
alter table links
  add column if not exists rpm_ip     text,
  add column if not exists rpm_device text,
  add column if not exists rpm_name   text;

-- ─── interactions: customer device + per-step audit trail ─────────────────
alter table interactions
  add column if not exists customer_device text,
  add column if not exists steps           jsonb default '[]'::jsonb;

-- ─── interactions: ensure anonymous users can insert ──────────────────────
-- (existing "public insert" policy covers this, but making it explicit)
drop policy if exists "interactions: public insert" on interactions;

create policy "interactions: anon insert"
  on interactions for insert
  to anon
  with check (true);

create policy "interactions: authenticated insert"
  on interactions for insert
  to authenticated
  with check (true);
