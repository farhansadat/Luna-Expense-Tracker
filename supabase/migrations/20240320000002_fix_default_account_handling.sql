-- Create a function to safely set an account as default
CREATE OR REPLACE FUNCTION public.set_account_as_default(
  account_id UUID,
  for_user_id UUID
) RETURNS void AS $$
BEGIN
  -- First, set all accounts for this user to non-default
  UPDATE accounts
  SET is_default = false
  WHERE user_id = for_user_id;
  
  -- Then set the specified account as default
  UPDATE accounts
  SET is_default = true
  WHERE id = account_id AND user_id = for_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.set_account_as_default TO authenticated;

-- Create a trigger to handle default account changes
CREATE OR REPLACE FUNCTION public.handle_default_account() RETURNS trigger AS $$
BEGIN
  IF NEW.is_default THEN
    -- If setting an account as default, unset any existing default first
    UPDATE accounts
    SET is_default = false
    WHERE user_id = NEW.user_id
    AND id != NEW.id
    AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add the trigger to the accounts table
DROP TRIGGER IF EXISTS handle_default_account_trigger ON accounts;
CREATE TRIGGER handle_default_account_trigger
  BEFORE INSERT OR UPDATE OF is_default
  ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION handle_default_account(); 