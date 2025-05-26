-- Fix profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS monthly_budget decimal(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';

-- Fix expenses table
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS recurring_frequency text,
ADD COLUMN IF NOT EXISTS tags text[];

-- Fix accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('personal', 'business', 'family')),
    balance decimal(12,2) DEFAULT 0,
    currency text NOT NULL,
    color text NOT NULL,
    icon text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_default boolean DEFAULT false,
    UNIQUE(user_id, name)
);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can insert their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can delete their own accounts" ON accounts;

-- Add RLS policies
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own accounts"
ON accounts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts"
ON accounts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
ON accounts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
ON accounts FOR DELETE
TO authenticated
USING (auth.uid() = user_id); 