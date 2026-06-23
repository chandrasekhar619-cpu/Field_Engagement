-- EngageKit Migration v8 — rename card_number to reminder_type (text) on links
-- Run in Supabase SQL Editor after migration v7

ALTER TABLE links RENAME COLUMN card_number TO reminder_type;
ALTER TABLE links ALTER COLUMN reminder_type TYPE text;
