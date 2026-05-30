-- EngageKit Migration v5 — allow interactions UPDATE from customer landing page
-- Run in Supabase SQL Editor

drop policy if exists "interactions: anon update" on interactions;
drop policy if exists "interactions: authenticated update" on interactions;

create policy "interactions: anon update"
  on interactions for update
  to anon
  using (true)
  with check (true);

create policy "interactions: authenticated update"
  on interactions for update
  to authenticated
  using (true)
  with check (true);
