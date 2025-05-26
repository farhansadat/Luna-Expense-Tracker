-- Create a function to safely create a new account
CREATE OR REPLACE FUNCTION public.create_new_account(
  p_user_id UUID,
  p_name TEXT,
  p_type TEXT,
  p_currency TEXT,
  p_color TEXT DEFAULT 'bg-gradient-to-br from-purple-500 to-indigo-500',
  p_icon TEXT DEFAULT 'wallet'
)
RETURNS UUID AS $$
DECLARE
  v_account_id UUID;
BEGIN
  -- Insert the new account
  INSERT INTO accounts (
    user_id,
    name,
    type,
    currency,
    color,
    icon,
    balance,
    is_default,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_name,
    p_type,
    p_currency,
    p_color,
    p_icon,
    0,
    false,
    NOW(),
    NOW()
  ) RETURNING id INTO v_account_id;

  RETURN v_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_new_account TO authenticated; 