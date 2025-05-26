-- Create a function to safely delete a user's account and all related data
CREATE OR REPLACE FUNCTION public.delete_user_account(user_id UUID)
RETURNS void AS $$
BEGIN
    -- Delete all expenses
    DELETE FROM expenses WHERE user_id = $1;
    
    -- Delete all accounts
    DELETE FROM accounts WHERE user_id = $1;
    
    -- Delete profile
    DELETE FROM profiles WHERE id = $1;
    
    -- Note: The actual user deletion from auth.users will be handled by the application
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account TO authenticated; 