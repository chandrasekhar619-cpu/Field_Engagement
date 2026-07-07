-- EngageKit Migration v10 — feedback table
-- Run in Supabase SQL Editor after migration v9
-- Safe to re-run: uses IF NOT EXISTS / IF EXISTS guards throughout

CREATE TABLE IF NOT EXISTS feedback (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  thumbs_up     boolean,
  feedback_text text,
  created_at    timestamptz DEFAULT now()
);

-- Add columns that may be missing if the table was created earlier without them
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS token    text;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS link_id  uuid;

CREATE INDEX IF NOT EXISTS feedback_token_idx ON feedback (token);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND policyname = 'Anyone can insert feedback'
  ) THEN
    CREATE POLICY "Anyone can insert feedback" ON feedback FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND policyname = 'Admins can read feedback'
  ) THEN
    CREATE POLICY "Admins can read feedback" ON feedback FOR SELECT USING (true);
  END IF;
END
$$;
