-- Migration v10: Add admin phone numbers to whitelist
-- Purpose: Enable login for Siddhi and Chandra (admin users)

INSERT INTO whitelist (phone, role) 
VALUES 
  ('9404557489', 'admin'),   -- Siddhi
  ('8320978236', 'admin')    -- Chandra
ON CONFLICT (phone) DO UPDATE SET role = 'admin';
