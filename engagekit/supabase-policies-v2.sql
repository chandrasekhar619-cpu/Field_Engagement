-- EngageKit — additional RLS policies (run after supabase-policies.sql)
-- Fixes: links insert for anon users, users update for PIN changes

-- ─── users: allow update (PIN updates, profile edits) ─────────────────────
create policy "users: public update"
  on users for update
  using (true)
  with check (true);

-- ─── links: explicit anon + authenticated insert ───────────────────────────
-- Drops the generic policy and replaces with an explicit one covering both roles.
drop policy if exists "links: public insert" on links;

create policy "links: anon insert"
  on links for insert
  to anon
  with check (true);

create policy "links: authenticated insert"
  on links for insert
  to authenticated
  with check (true);
