-- EngageKit Migration v6 — renewal card support on share_tokens
-- Run in Supabase SQL Editor

ALTER TABLE share_tokens ADD COLUMN IF NOT EXISTS engagement_type text;
ALTER TABLE share_tokens ADD COLUMN IF NOT EXISTS metadata jsonb;
