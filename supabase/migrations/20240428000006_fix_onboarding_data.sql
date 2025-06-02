-- Update profiles table to store onboarding data
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS total_balance decimal(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_income decimal(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_budget decimal(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_data jsonb DEFAULT '{}'::jsonb;

-- Create function to sync onboarding data
CREATE OR REPLACE FUNCTION sync_onboarding_data()
RETURNS trigger AS $$
BEGIN
  -- Update total_balance and monthly_income when onboarding_data changes
  IF NEW.onboarding_data IS NOT NULL AND NEW.onboarding_data != OLD.onboarding_data THEN
    NEW.total_balance = COALESCE((NEW.onboarding_data->>'totalBalance')::decimal, NEW.total_balance);
    NEW.monthly_income = COALESCE((NEW.onboarding_data->>'monthlyIncome')::decimal, NEW.monthly_income);
    NEW.monthly_budget = COALESCE((NEW.onboarding_data->>'monthlyBudget')::decimal, NEW.monthly_budget);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for syncing onboarding data
DROP TRIGGER IF EXISTS sync_onboarding_data_trigger ON profiles;
CREATE TRIGGER sync_onboarding_data_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_onboarding_data();

-- Create index for onboarding status
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_completed);

-- Update RLS policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON profiles
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$; 