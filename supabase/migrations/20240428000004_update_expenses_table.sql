-- Add missing columns to expenses table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'expense',
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurring_frequency VARCHAR(20),
ADD COLUMN IF NOT EXISTS bill_url TEXT;

-- Create index on type column
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);

-- Create index on user_id and type
CREATE INDEX IF NOT EXISTS idx_expenses_user_type ON expenses(user_id, type);

-- Add constraint for type values
ALTER TABLE expenses 
ADD CONSTRAINT check_expense_type 
CHECK (type IN ('income', 'expense'));

-- Add RLS policies if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'expenses' 
    AND policyname = 'Users can view their own expenses'
  ) THEN
    CREATE POLICY "Users can view their own expenses"
      ON expenses
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'expenses' 
    AND policyname = 'Users can insert their own expenses'
  ) THEN
    CREATE POLICY "Users can insert their own expenses"
      ON expenses
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'expenses' 
    AND policyname = 'Users can update their own expenses'
  ) THEN
    CREATE POLICY "Users can update their own expenses"
      ON expenses
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'expenses' 
    AND policyname = 'Users can delete their own expenses'
  ) THEN
    CREATE POLICY "Users can delete their own expenses"
      ON expenses
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$; 