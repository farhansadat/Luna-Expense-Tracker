-- Add total_balance column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS total_balance decimal(12,2) DEFAULT 0; 