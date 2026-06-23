-- EngageKit Migration v6 — renewal card metadata on share_tokens
-- Run in Supabase SQL Editor

-- engagement_type is NOT used for routing (routing goes through links.content_id → contentItems.demoType)
-- Only metadata is needed here — stores card_number, ppt, sum_assured, maturity, premium
ALTER TABLE share_tokens ADD COLUMN IF NOT EXISTS engagement_type text;
ALTER TABLE share_tokens ADD COLUMN IF NOT EXISTS metadata jsonb;
