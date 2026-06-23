-- EngageKit Migration v9 — policy_metadata table for renewal detail auto-population
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS policy_metadata (
  policy_number text PRIMARY KEY,
  premium       integer,
  ppt           integer,
  sum_assured   integer,
  maturity      integer,
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE policy_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RPMs can read policy metadata"
  ON policy_metadata FOR SELECT
  USING (true);

CREATE POLICY "RPMs can upsert policy metadata"
  ON policy_metadata FOR INSERT
  WITH CHECK (true);

CREATE POLICY "RPMs can update policy metadata"
  ON policy_metadata FOR UPDATE
  USING (true);
