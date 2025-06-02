-- Add color and icon columns to accounts table
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS color text,
ADD COLUMN IF NOT EXISTS icon text; 