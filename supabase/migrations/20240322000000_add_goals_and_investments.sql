-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    target_amount decimal(12,2) NOT NULL,
    current_amount decimal(12,2) DEFAULT 0,
    deadline date NOT NULL,
    category text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('stocks', 'bonds', 'crypto', 'real_estate', 'cash', 'other')),
    amount decimal(12,2) NOT NULL,
    current_value decimal(12,2) NOT NULL,
    purchase_date date NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Create policies for goals
CREATE POLICY "Users can view their own goals"
ON goals FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
ON goals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON goals FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
ON goals FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create policies for investments
CREATE POLICY "Users can view their own investments"
ON investments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investments"
ON investments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments"
ON investments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investments"
ON investments FOR DELETE
TO authenticated
USING (auth.uid() = user_id); 