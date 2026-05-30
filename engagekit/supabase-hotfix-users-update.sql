-- Run this in the Supabase SQL Editor if the admin profile form shows "Could not save".
-- It adds the missing UPDATE policy on the users table.

drop policy if exists "users: public update" on users;

create policy "users: public update"
  on users for update
  using (true)
  with check (true);
