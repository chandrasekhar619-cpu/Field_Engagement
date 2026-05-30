-- EngageKit Migration v4 — customer name on links, feedback update policy
-- Run in Supabase SQL Editor

-- ─── links: store customer name at link-generation time ───────────────────
alter table links
  add column if not exists customer_name text;

-- ─── feedback: allow updating comment after thumb is saved ────────────────
drop policy if exists "feedback: public update" on feedback;

create policy "feedback: public update"
  on feedback for update
  using (true)
  with check (true);
