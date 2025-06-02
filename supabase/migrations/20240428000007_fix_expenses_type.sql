-- Drop existing type constraint if exists
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS check_expense_type;

-- Drop existing type column if exists
ALTER TABLE expenses DROP COLUMN IF EXISTS type;

-- Add type column with proper constraint
ALTER TABLE expenses 
ADD COLUMN type VARCHAR(20) DEFAULT 'expense';

-- Add constraint for type values
ALTER TABLE expenses 
ADD CONSTRAINT check_expense_type 
CHECK (type IN ('income', 'expense'));

-- Create index on type column
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);

-- Create index on user_id and type
CREATE INDEX IF NOT EXISTS idx_expenses_user_type ON expenses(user_id, type);

-- Update existing expenses to have type='expense'
UPDATE expenses SET type = 'expense' WHERE type IS NULL; 