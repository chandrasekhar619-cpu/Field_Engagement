-- EngageKit Migration v7 — card_number column on links
-- Run in Supabase SQL Editor

-- Stores which renewal card was sent (1 = Final, 2 = 30-Day, 3 = 2-Week),
-- making it directly queryable without parsing share_tokens.metadata JSON.
ALTER TABLE links ADD COLUMN IF NOT EXISTS card_number integer;
