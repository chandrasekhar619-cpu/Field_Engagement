-- EngageKit Migration v10 — feedback table
-- Run in Supabase SQL Editor after migration v9

CREATE TABLE IF NOT EXISTS feedback (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  token         text,           -- matches links.token; index below
  link_id       uuid,           -- optional direct link reference
  thumbs_up     boolean,        -- true = 👍, false = 👎, null = not rated
  feedback_text text,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feedback_token_idx ON feedback (token);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read feedback"
  ON feedback FOR SELECT
  USING (true);
