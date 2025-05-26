-- Add monthly_budget column to accounts table
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS monthly_budget decimal(12,2);
 
-- Update existing accounts to have null monthly_budget
UPDATE accounts
SET monthly_budget = NULL
WHERE monthly_budget IS NULL; 