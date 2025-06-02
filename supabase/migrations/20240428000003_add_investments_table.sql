-- Create investments table if it doesn't exist
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) NOT NULL,
  purchase_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for investments
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  -- Create policies if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'investments' 
    AND policyname = 'Users can view their own investments'
  ) THEN
    CREATE POLICY "Users can view their own investments"
      ON investments
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'investments' 
    AND policyname = 'Users can insert their own investments'
  ) THEN
    CREATE POLICY "Users can insert their own investments"
      ON investments
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'investments' 
    AND policyname = 'Users can update their own investments'
  ) THEN
    CREATE POLICY "Users can update their own investments"
      ON investments
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'investments' 
    AND policyname = 'Users can delete their own investments'
  ) THEN
    CREATE POLICY "Users can delete their own investments"
      ON investments
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'investments' 
    AND indexname = 'idx_investments_user_id'
  ) THEN
    CREATE INDEX idx_investments_user_id ON investments(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'investments' 
    AND indexname = 'idx_investments_type'
  ) THEN
    CREATE INDEX idx_investments_type ON investments(type);
  END IF;
END $$;

-- Create trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_investments_updated_at'
  ) THEN
    CREATE TRIGGER update_investments_updated_at
      BEFORE UPDATE ON investments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$; 